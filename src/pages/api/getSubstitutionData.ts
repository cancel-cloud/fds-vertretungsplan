// src/pages/api/getSubstitutionData.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import generateDate from "@/pages/api/getDate";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const date = generateDate();
        console.error(date)
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append(
            'Cookie',
            'schoolname="_ZGVzc2F1ZXItc2NodWxlLWxpbWJ1cmc="; JSESSIONID=2EDFB9B5540CF6D997812C04BECD95BC; schoolname="_ZGVzc2F1ZXItc2NodWxlLWxpbWJ1cmc="'
        );

        const raw = JSON.stringify({
            formatName: 'Web-Schüler-heute',
            schoolName: 'dessauer-schule-limburg',
            date: 20240607,
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
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow' as RequestRedirect,
        };

        try {
            const response = await fetch(
                'https://hepta.webuntis.com/WebUntis/monitor/substitution/data?school=dessauer-schule-limburg',
                requestOptions
            );
            const result = await response.json();
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};

export default handler;
