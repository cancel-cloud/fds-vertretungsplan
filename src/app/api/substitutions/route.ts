import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();

    const requestData = {
      formatName: "Web-Schüler-heute",
      schoolName: "dessauer-schule-limburg",
      date: date,
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

    const response = await fetch(
      "https://hepta.webuntis.com/WebUntis/monitor/substitution/data?school=dessauer-schule-limburg",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie":
            'Tenant-Id="3997500"; schoolname="_ZGVzc2F1ZXItc2NodWxlLWxpbWJ1cmc="; traceId=b373d28e06773540aa0d041ef4c5dece30be1025; JSESSIONID=74084C0D96D8FC1BDE35D8AAEF50B132',
        },
        body: JSON.stringify(requestData),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in substitutions API:", error);
    return NextResponse.json(
      { error: "Failed to fetch substitutions" },
      { status: 500 }
    );
  }
} 