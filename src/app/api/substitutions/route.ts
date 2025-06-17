import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

const SCHOOL_NAME = "dessauer-schule-limburg";
const BASE_URL = "https://hepta.webuntis.com";

interface UntisSession {
  tenantId: string;
  schoolNameCookie: string;
  sessionId: string;
  traceId: string;
}

function generateTraceId() {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function encodeSchoolName(schoolName: string): string {
  return Buffer.from(schoolName, 'utf-8').toString('base64');
}

async function getUntisSession(): Promise<UntisSession> {
  const schoolNameEncoded = encodeSchoolName(SCHOOL_NAME);
  const url = `${BASE_URL}/WebUntis/monitor/substitution/data?school=${SCHOOL_NAME}`;
  
  const initialResponse = await fetch(url, {
    method: 'GET',
    headers: { 'Cookie': `schoolname="${schoolNameEncoded}"` },
    redirect: 'follow'
  });

  const cookies = initialResponse.headers.get('set-cookie');
  if (!cookies) throw new Error('Could not retrieve session cookies from WebUntis.');

  const tenantIdMatch = cookies.match(/Tenant-Id="(\d+)"/);
  const sessionIdMatch = cookies.match(/JSESSIONID=([A-Z0-9]+)/);

  if (!tenantIdMatch || !sessionIdMatch) {
    throw new Error('Essential session cookies (Tenant-Id, JSESSIONID) not found.');
  }

  return {
    tenantId: tenantIdMatch[1],
    schoolNameCookie: `schoolname="${schoolNameEncoded}"`,
    sessionId: sessionIdMatch[1],
    traceId: generateTraceId(),
  };
}

function buildRequestPayload(date: string) {
    return {
        "formatName": "Web-Schüler-heute",
        "schoolName": SCHOOL_NAME,
        "date": parseInt(date),
        "dateOffset": 0,
        "activityTypeIds": [],
        "departmentElementType": -1,
        "departmentIds": [],
        "enableSubstitutionFrom": false,
        "groupBy": 1,
        "hideAbsent": false,
        "hideCancelCausedByEvent": false,
        "hideCancelWithSubstitution": true,
        "mergeBlocks": true,
        "showAbsentElements": [],
        "showAbsentTeacher": true,
        "showAffectedElements": [1],
        "showBreakSupervisions": false,
        "showCancel": true,
        "showClass": true,
        "showEvent": true,
        "showExamSupervision": false,
        "showHour": true,
        "showInfo": true,
        "showMessages": true,
        "showOnlyCancel": false,
        "showOnlyFutureSub": true,
        "showRoom": true,
        "showStudentgroup": false,
        "showSubject": true,
        "showSubstText": true,
        "showSubstTypeColor": false,
        "showSubstitutionFrom": 0,
        "showTeacher": true,
        "showTeacherOnEvent": false,
        "showTime": true,
        "showUnheraldedExams": false,
        "showUnitTime": false,
        "strikethrough": true,
        "strikethroughAbsentTeacher": true
    };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  try {
    const session = await getUntisSession();
    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const cookieString = [
      `Tenant-Id="${session.tenantId}"`,
      session.schoolNameCookie,
      `traceId=${session.traceId}`,
      `JSESSIONID=${session.sessionId}`
    ].join('; ');
    myHeaders.append("Cookie", cookieString);

    const raw = JSON.stringify(buildRequestPayload(date));

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    const url = `${BASE_URL}/WebUntis/monitor/substitution/data?school=${SCHOOL_NAME}`;
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
        const errorText = await response.text();
        console.error("WebUntis API Error:", errorText);
        return NextResponse.json({ error: `API request failed with status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch substitutions', details: errorMessage }, { status: 500 });
  }
} 