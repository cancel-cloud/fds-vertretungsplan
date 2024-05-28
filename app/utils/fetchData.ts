import axios from 'axios';

const fetchData = async () => {
    console.log("Function was ran.");
    try {
        const response = await axios.post('https://hepta.webuntis.com/WebUntis/monitor/substitution/data?school=dessauer-schule-limburg', {
            "formatName": "Web-Schüler-heute",
            "schoolName": "dessauer-schule-limburg",
            "date": 20240528,
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
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log("Response data: ", response.data);
        return response.data.payload.rows || [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

export default fetchData;
