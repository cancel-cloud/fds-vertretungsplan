import { WebUntisRequest, WebUntisResponse, WebUntisSubstitutionRow } from '@/types';
import { buildSubstitutionUrl, resolveBaseUrl, resolveSchoolName } from '@/app/api/substitutions/route-utils';
import { getDemoRowsForDate, getStoredDemoDataset } from '@/lib/demo-substitutions';
import { isDemoDateAllowed, isDemoMode } from '@/lib/demo-config';
import { calculateExponentialBackoff } from '@/lib/retry-utils';

const JSON_CONTENT_TYPE = /application\/json/i;
const ERROR_SNIPPET_LIMIT = 500;
const UPSTREAM_MAX_ATTEMPTS = 3;
const UPSTREAM_RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const NETWORK_RETRYABLE_CODES = new Set([
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'ETIMEDOUT',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

interface ParsedResponseBody {
  contentType: string;
  rawText?: string;
  json?: unknown;
}

export class UntisUpstreamError extends Error {
  status?: number;
  retryable: boolean;
  code?: string;

  constructor(message: string, options?: { status?: number; retryable?: boolean; code?: string; cause?: unknown }) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'UntisUpstreamError';
    this.status = options?.status;
    this.retryable = Boolean(options?.retryable);
    this.code = options?.code;
  }
}

export const toUntisDateNumber = (date: Date): number => toDateNumber(date);

function toDateNumber(date: Date): number {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return Number.parseInt(`${year}${month}${day}`, 10);
}

export function buildUntisRequestPayload(date: number, schoolName: string): WebUntisRequest {
  return {
    formatName: 'Web-Schüler-heute',
    schoolName,
    date,
    dateOffset: 0,
    activityTypeIds: [],
    departmentElementType: -1,
    departmentIds: [],
    enableSubstitutionFrom: false,
    groupBy: 1,
    hideAbsent: false,
    hideCancelCausedByEvent: false,
    hideCancelWithSubstitution: true,
    mergeBlocks: true,
    showAbsentElements: [],
    showAbsentTeacher: true,
    showAffectedElements: [1],
    showBreakSupervisions: false,
    showCancel: true,
    showClass: true,
    showEvent: true,
    showExamSupervision: false,
    showHour: true,
    showInfo: true,
    showMessages: true,
    showOnlyCancel: false,
    showOnlyFutureSub: true,
    showRoom: true,
    showStudentgroup: false,
    showSubject: true,
    showSubstText: true,
    showSubstTypeColor: false,
    showSubstitutionFrom: 0,
    showTeacher: true,
    showTeacherOnEvent: false,
    showTime: true,
    showUnheraldedExams: false,
    showUnitTime: false,
    strikethrough: true,
    strikethroughAbsentTeacher: true,
  };
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const directCode = (error as { code?: unknown }).code;
  if (typeof directCode === 'string' && directCode.length > 0) {
    return directCode;
  }

  const cause = (error as { cause?: unknown }).cause;
  if (cause && typeof cause === 'object') {
    const causeCode = (cause as { code?: unknown }).code;
    if (typeof causeCode === 'string' && causeCode.length > 0) {
      return causeCode;
    }
  }

  return undefined;
}

function isRetryableNetworkError(error: unknown): boolean {
  const code = getErrorCode(error);
  return Boolean(code && NETWORK_RETRYABLE_CODES.has(code));
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseResponseBody(response: Response): Promise<ParsedResponseBody> {
  const contentType = response.headers.get('content-type') || '';
  let rawText: string | undefined;

  try {
    rawText = await response.text();
  } catch (error) {
    console.warn('Failed to read WebUntis response body', error);
  }

  if (rawText && JSON_CONTENT_TYPE.test(contentType)) {
    try {
      return { contentType, rawText, json: JSON.parse(rawText) };
    } catch (error) {
      console.warn('Failed to parse WebUntis JSON body', error);
    }
  }

  return { contentType, rawText };
}

function extractErrorSnippet(body: ParsedResponseBody): string | undefined {
  if (body.json && typeof body.json === 'object') {
    const jsonBody = body.json as Record<string, unknown>;
    const errorField = jsonBody.error;

    if (typeof errorField === 'string' && errorField.trim()) {
      return errorField.trim().slice(0, ERROR_SNIPPET_LIMIT);
    }

    if (errorField && typeof errorField === 'object') {
      const errorObject = errorField as Record<string, unknown>;
      if (typeof errorObject.message === 'string' && errorObject.message.trim()) {
        return errorObject.message.trim().slice(0, ERROR_SNIPPET_LIMIT);
      }
      if (typeof errorObject.data === 'string' && errorObject.data.trim()) {
        return errorObject.data.trim().slice(0, ERROR_SNIPPET_LIMIT);
      }
    }

    if (typeof jsonBody.message === 'string' && jsonBody.message.trim()) {
      return jsonBody.message.trim().slice(0, ERROR_SNIPPET_LIMIT);
    }
  }

  if (body.rawText) {
    const trimmed = body.rawText.trim();
    if (trimmed.length > 0) {
      return trimmed.slice(0, ERROR_SNIPPET_LIMIT);
    }
  }

  return undefined;
}

function formatUntisError(context: string, response: Response, body: ParsedResponseBody): Error {
  const statusInfo = `${response.status}${response.statusText ? ` ${response.statusText}` : ''}`.trim();
  const snippet = extractErrorSnippet(body);
  const baseMessage = `${context} failed with status ${statusInfo || 'unknown'}`;
  return new UntisUpstreamError(snippet ? `${baseMessage}: ${snippet}` : baseMessage, {
    status: response.status,
    retryable: UPSTREAM_RETRYABLE_STATUS_CODES.has(response.status),
  });
}

function hasSubstitutionPayload(data: unknown): data is WebUntisResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const payload = (data as WebUntisResponse).payload;
  return Boolean(payload && typeof payload === 'object' && Array.isArray(payload.rows));
}

export async function requestUntisSubstitutionData(
  substitutionUrl: string,
  payload: WebUntisRequest
): Promise<WebUntisResponse> {
  for (let attempt = 1; attempt <= UPSTREAM_MAX_ATTEMPTS; attempt += 1) {
    try {
      const substitutionResponse = await fetch(substitutionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        redirect: 'manual',
        cache: 'no-store',
      });

      const responseBody = await parseResponseBody(substitutionResponse);

      if (!substitutionResponse.ok) {
        const error = formatUntisError('WebUntis substitution request', substitutionResponse, responseBody);
        if (
          error instanceof UntisUpstreamError &&
          error.retryable &&
          attempt < UPSTREAM_MAX_ATTEMPTS
        ) {
          const backoffDelay = calculateExponentialBackoff(attempt);
          await sleep(backoffDelay);
          continue;
        }
        throw error;
      }

      if (!responseBody.json || typeof responseBody.json !== 'object') {
        throw new UntisUpstreamError('WebUntis response was not JSON.', { retryable: false });
      }

      return responseBody.json as WebUntisResponse;
    } catch (error) {
      if (attempt < UPSTREAM_MAX_ATTEMPTS && isRetryableNetworkError(error)) {
        const backoffDelay = calculateExponentialBackoff(attempt);
        await sleep(backoffDelay);
        continue;
      }

      if (error instanceof UntisUpstreamError) {
        throw error;
      }

      if (isRetryableNetworkError(error)) {
        throw new UntisUpstreamError('WebUntis network request timed out or failed.', {
          retryable: true,
          code: getErrorCode(error),
          cause: error,
        });
      }

      throw new UntisUpstreamError('WebUntis request failed unexpectedly.', { retryable: false, cause: error });
    }
  }

  throw new UntisUpstreamError('WebUntis request failed after retries.', { retryable: true });
}

export async function fetchUntisRowsForDate(date: Date): Promise<{ date: number; rows: WebUntisSubstitutionRow[] }> {
  const numericDate = toUntisDateNumber(date);

  if (isDemoMode()) {
    if (!isDemoDateAllowed(numericDate)) {
      return { date: numericDate, rows: [] };
    }

    const dataset = await getStoredDemoDataset();
    if (!dataset) {
      return { date: numericDate, rows: [] };
    }

    return {
      date: numericDate,
      rows: getDemoRowsForDate(dataset, numericDate),
    };
  }

  const schoolName = resolveSchoolName();
  const baseUrl = resolveBaseUrl(schoolName);
  const url = buildSubstitutionUrl(baseUrl, schoolName);
  const rawData = await requestUntisSubstitutionData(url, buildUntisRequestPayload(numericDate, schoolName));

  if (!hasSubstitutionPayload(rawData)) {
    return { date: numericDate, rows: [] };
  }

  return {
    date: rawData.payload?.date ?? numericDate,
    rows: rawData.payload?.rows ?? [],
  };
}
