import { NextRequest, NextResponse } from 'next/server';
import {
  SubstitutionApiResponse,
  WebUntisRequest,
  WebUntisResponse,
} from '@/types';
import { captureServerEvent } from '@/lib/analytics/posthog-server';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { sanitizeDeviceId } from '@/lib/analytics/device-id';
import {
  buildSubstitutionUrl,
  normalizeDateParam,
  resolveBaseUrl,
  resolveSchoolName,
} from '@/app/api/substitutions/route-utils';

const META_RESPONSE_MESSAGE = 'No substitution data found. Only configuration returned.';
const JSON_CONTENT_TYPE = /application\/json/i;
const ERROR_SNIPPET_LIMIT = 500;
const RESPONSE_CACHE_TTL_MS = 30_000;
const RESPONSE_CACHE_STALE_IF_ERROR_TTL_MS = 30 * 60 * 1000;
const RESPONSE_CACHE_MAX_AGE_SECONDS = Math.floor(RESPONSE_CACHE_TTL_MS / 1000);
const RESPONSE_CACHE_SWR_SECONDS = 60;
const RESPONSE_CACHE_MAX_ENTRIES = 200;
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
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_MAX_ENTRIES = 1000;

// Best-effort in-memory controls for serverless instances.
// State is not durable across cold starts.
const responseCache = new Map<string, { timestamp: number; data: SubstitutionApiResponse }>();
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface ParsedResponseBody {
  contentType: string;
  rawText?: string;
  json?: unknown;
}

class UntisUpstreamError extends Error {
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

/**
 * Calculates exponential backoff delay with jitter to avoid thundering herd.
 * Uses full jitter strategy: randomizes the delay between 0 and the exponential backoff value.
 * 
 * @param attempt - The current attempt number (1-indexed)
 * @param baseDelayMs - The base delay in milliseconds (default: 100ms)
 * @param maxDelayMs - The maximum delay in milliseconds (default: 5000ms)
 * @returns The delay in milliseconds with jitter applied
 */
function calculateExponentialBackoff(attempt: number, baseDelayMs = 100, maxDelayMs = 5000): number {
  // Calculate exponential backoff: baseDelay * 2^(attempt - 1)
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  
  // Apply full jitter: random value between 0 and cappedDelay
  return Math.floor(Math.random() * cappedDelay);
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

function getDistinctId(req: NextRequest): string {
  const incoming = sanitizeDeviceId(req.headers.get('x-device-id'));
  return incoming ?? 'api-anonymous';
}

function pruneRateLimitStore(now: number) {
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  }

  if (rateLimitStore.size <= RATE_LIMIT_MAX_ENTRIES) {
    return;
  }

  const entries = [...rateLimitStore.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  const overflow = rateLimitStore.size - RATE_LIMIT_MAX_ENTRIES;
  for (let index = 0; index < overflow; index += 1) {
    rateLimitStore.delete(entries[index][0]);
  }
}

function pruneResponseCache(now: number) {
  for (const [key, entry] of responseCache.entries()) {
    if (now - entry.timestamp > RESPONSE_CACHE_STALE_IF_ERROR_TTL_MS) {
      responseCache.delete(key);
    }
  }

  if (responseCache.size <= RESPONSE_CACHE_MAX_ENTRIES) {
    return;
  }

  const entries = [...responseCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  const overflow = responseCache.size - RESPONSE_CACHE_MAX_ENTRIES;

  for (let index = 0; index < overflow; index += 1) {
    responseCache.delete(entries[index][0]);
  }
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

const cacheControlHeader = `public, max-age=${RESPONSE_CACHE_MAX_AGE_SECONDS}, s-maxage=${RESPONSE_CACHE_MAX_AGE_SECONDS}, stale-while-revalidate=${RESPONSE_CACHE_SWR_SECONDS}`;

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

function buildRequestPayload(date: number, schoolName: string): WebUntisRequest {
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

async function requestSubstitutionData(
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

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  const distinctId = getDistinctId(req);
  const clientIp = getClientIp(req);

  pruneRateLimitStore(startedAt);
  pruneResponseCache(startedAt);

  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_RATE_LIMITED, distinctId, {
      retry_after_seconds: rateLimit.retryAfterSeconds,
      ip_hash_source: clientIp !== 'unknown',
    });

    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte versuchen Sie es in Kürze erneut.' },
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': rateLimit.retryAfterSeconds.toString(),
        },
      }
    );
  }

  try {
    const schoolName = resolveSchoolName();
    const baseUrl = resolveBaseUrl(schoolName);
    const substitutionUrl = buildSubstitutionUrl(baseUrl, schoolName);

    const { numeric } = normalizeDateParam(
      req.nextUrl.searchParams.get('date'),
      req.nextUrl.searchParams.get('dateOffset')
    );

    const cacheKey = `${schoolName}:${numeric}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_TTL_MS) {
      void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_CACHE_HIT, distinctId, {
        date: numeric,
        duration_ms: Date.now() - startedAt,
      });

      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': cacheControlHeader,
        },
      });
    }

    const payload = buildRequestPayload(numeric, schoolName);
    let rawData: WebUntisResponse;
    try {
      rawData = await requestSubstitutionData(substitutionUrl, payload);
    } catch (upstreamError) {
      const staleCached = responseCache.get(cacheKey);
      if (staleCached) {
        console.warn('Serving stale substitution cache after upstream failure', {
          date: numeric,
        });

        return NextResponse.json(staleCached.data, {
          headers: {
            'Cache-Control': 'public, max-age=0, s-maxage=0, stale-while-revalidate=60',
            'X-Data-Source': 'stale-cache',
          },
        });
      }

      throw upstreamError;
    }

    if (hasSubstitutionPayload(rawData)) {
      const payloadData = rawData.payload!;
      const responsePayload: SubstitutionApiResponse = {
        type: 'substitution',
        date: payloadData.date ?? numeric,
        rows: payloadData.rows ?? [],
        lastUpdate: payloadData.lastUpdate ?? null,
      };

      responseCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
      pruneResponseCache(Date.now());

      void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_SUCCESS, distinctId, {
        date: payloadData.date ?? numeric,
        row_count: responsePayload.rows.length,
        duration_ms: Date.now() - startedAt,
      });

      return NextResponse.json(responsePayload, {
        headers: {
          'Cache-Control': cacheControlHeader,
        },
      });
    }

    console.warn('WebUntis returned metadata without substitution payload', {
      date: numeric,
    });

    const responsePayload: SubstitutionApiResponse = {
      type: 'meta',
      date: numeric,
      schoolName,
      message: META_RESPONSE_MESSAGE,
    };

    responseCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
    pruneResponseCache(Date.now());

    void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_META, distinctId, {
      date: numeric,
      duration_ms: Date.now() - startedAt,
    });

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': cacheControlHeader,
      },
    });
  } catch (error) {
    console.error('Failed to fetch WebUntis substitution data', error);

    void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_ERROR, distinctId, {
      duration_ms: Date.now() - startedAt,
      message_length: error instanceof Error ? error.message.length : 0,
    });

    const isUpstreamUnavailable =
      error instanceof UntisUpstreamError && (error.retryable || error.status === 503 || error.status === 504);

    return NextResponse.json(
      {
        error: isUpstreamUnavailable
          ? 'Vertretungsdaten sind aktuell nicht erreichbar. Bitte versuche es in ein paar Minuten erneut.'
          : 'Fehler beim Laden der Vertretungen. Bitte versuchen Sie es später erneut.',
      },
      {
        status: isUpstreamUnavailable ? 503 : 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
