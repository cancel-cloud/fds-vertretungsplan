import { WebUntisRequest, WebUntisResponse, WebUntisSubstitutionRow } from '@/types';
import { buildSubstitutionUrl, resolveBaseUrl, resolveSchoolName } from '@/app/api/substitutions/route-utils';
import { isDemoDateAllowed, isDemoMode } from '@/lib/demo-config';
import { getDemoRowsForDate, getStoredDemoDataset } from '@/lib/demo-substitutions';

const JSON_CONTENT_TYPE = /application\/json/i;

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

export const toUntisDateNumber = (date: Date): number => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return Number.parseInt(`${year}${month}${day}`, 10);
};

export async function fetchUntisRows(date: Date): Promise<{ date: number; rows: WebUntisSubstitutionRow[] }> {
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(buildRequestPayload(numericDate, schoolName)),
    redirect: 'manual',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`WebUntis request failed (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!JSON_CONTENT_TYPE.test(contentType)) {
    throw new Error('WebUntis response is not JSON.');
  }

  const data = (await response.json()) as WebUntisResponse;

  if (!data.payload || !Array.isArray(data.payload.rows)) {
    return { date: numericDate, rows: [] };
  }

  return {
    date: data.payload.date ?? numericDate,
    rows: data.payload.rows,
  };
}
