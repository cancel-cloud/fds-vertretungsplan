import { NextRequest, NextResponse } from 'next/server';
import { WebUntisRequest, WebUntisResponse } from '@/types';

const DEFAULT_SCHOOL_NAME = 'friedrich-dessauer-schule-limburg';
const SUBSTITUTION_PATH = '/WebUntis/monitor/substitution/data';
const META_RESPONSE_MESSAGE = 'No substitution data found. Only configuration returned.';
const JSON_CONTENT_TYPE = /application\/json/i;
const ERROR_SNIPPET_LIMIT = 500;

interface ParsedResponseBody {
  contentType: string;
  rawText?: string;
  json?: unknown;
}

function resolveSchoolName() {
  const configured = process.env.UNTIS_SCHOOL?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_SCHOOL_NAME;
}

function resolveBaseUrl(schoolName: string) {
  const envUrl = process.env.UNTIS_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return `https://${schoolName}.webuntis.com`;
}

function buildSubstitutionUrl(baseUrl: string, schoolName: string) {
  return `${baseUrl}${SUBSTITUTION_PATH}?school=${encodeURIComponent(schoolName)}`;
}

const SCHOOL_NAME = resolveSchoolName();
const BASE_URL = resolveBaseUrl(SCHOOL_NAME);
const SUBSTITUTION_URL = buildSubstitutionUrl(BASE_URL, SCHOOL_NAME);

function formatDateForUntis(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const formatted = `${year}${month}${day}`;
  return {
    raw: formatted,
    numeric: Number.parseInt(formatted, 10),
  };
}

function normalizeDateParam(dateParam: string | null, offsetParam: string | null) {
  if (dateParam && /^\d{8}$/.test(dateParam)) {
    return {
      raw: dateParam,
      numeric: Number.parseInt(dateParam, 10),
    };
  }

  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;
  const targetDate = new Date();
  targetDate.setHours(0, 0, 0, 0);

  if (!Number.isNaN(offset) && offset !== 0) {
    targetDate.setDate(targetDate.getDate() + offset);
  }

  return formatDateForUntis(targetDate);
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
      const errObj = errorField as Record<string, unknown>;
      if (typeof errObj.message === 'string' && errObj.message.trim()) {
        return errObj.message.trim().slice(0, ERROR_SNIPPET_LIMIT);
      }
      if (typeof errObj.data === 'string' && errObj.data.trim()) {
        return errObj.data.trim().slice(0, ERROR_SNIPPET_LIMIT);
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
  const statusInfo = `${response.status}${
    response.statusText ? ` ${response.statusText}` : ''
  }`.trim();
  const snippet = extractErrorSnippet(body);
  const baseMessage = `${context} failed with status ${statusInfo || 'unknown'}`;
  return new Error(snippet ? `${baseMessage}: ${snippet}` : baseMessage);
}

function hasSubstitutionPayload(data: unknown): data is WebUntisResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const payload = (data as WebUntisResponse).payload;
  return Boolean(
    payload &&
    typeof payload === 'object' &&
    Array.isArray(payload.rows)
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return { raw: value };
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

async function requestSubstitutionData(payload: WebUntisRequest): Promise<WebUntisResponse> {
  const substitutionResponse = await fetch(SUBSTITUTION_URL, {
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
    throw formatUntisError('WebUntis substitution request', substitutionResponse, responseBody);
  }

  if (!responseBody.json || typeof responseBody.json !== 'object') {
    throw new Error('WebUntis response was not JSON.');
  }

  return responseBody.json as WebUntisResponse;
}

export async function GET(req: NextRequest) {
  const { numeric } = normalizeDateParam(
    req.nextUrl.searchParams.get('date'),
    req.nextUrl.searchParams.get('dateOffset')
  );
  const payload = buildRequestPayload(numeric, SCHOOL_NAME);

  try {
    const rawData = await requestSubstitutionData(payload);

    if (hasSubstitutionPayload(rawData)) {
      const payloadData = rawData.payload!;
      return NextResponse.json({
        type: 'substitution',
        date: payloadData.date ?? numeric,
        rows: payloadData.rows ?? [],
        lastUpdate: payloadData.lastUpdate ?? null,
      });
    }

    const config = asRecord(rawData);
    const responseSchoolName =
      typeof config.schoolName === 'string' ? config.schoolName : SCHOOL_NAME;

    console.warn('WebUntis returned configuration metadata without payload', {
      date: config.date ?? numeric,
    });

    return NextResponse.json({
      type: 'meta',
      date: typeof config.date === 'number' ? config.date : numeric,
      schoolName: responseSchoolName,
      config,
      message: META_RESPONSE_MESSAGE,
    });
  } catch (error) {
    console.error('Failed to fetch WebUntis substitution data', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error while fetching WebUntis substitution data.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
