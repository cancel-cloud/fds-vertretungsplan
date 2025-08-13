/**
 * Application constants and configuration
 */

export const API_CONFIG = {
  WEBUNTIS_BASE_URL: "https://hepta.webuntis.com/WebUntis/monitor/substitution/data",
  SCHOOL_NAME: "dessauer-schule-limburg",
  FORMAT_NAME: "Web-Schüler-heute",
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    "Cookie": 'schoolname="_ZGVzc2F1ZXItc2NodWxlLWxpbWJ1cmc="; JSESSIONID=2EDFB9B5540CF6D997812C04BECD95BC; schoolname="_ZGVzc2F1ZXItc2NodWxlLWxpbWJ1cmc="',
  },
} as const;

export const UI_CONFIG = {
  LOADING_SPINNER_SIZE: "h-32 w-32",
  GRID_BREAKPOINTS: {
    MOBILE: "grid-cols-1",
    TABLET: "md:grid-cols-2", 
    DESKTOP: "lg:grid-cols-3",
  },
  EASTER_EGG_TRIGGER: "mr big",
  EASTER_EGG_IMAGE: "/MRBIG.JPG",
} as const;

export const SUBSTITUTION_FIELDS = {
  HOUR: 0,
  TIME: 1,
  CLASS: 2,
  SUBJECT: 3,
  ROOM: 4,
  TEACHER: 5,
  INFO: 6,
  SUBSTITUTION_TEXT: 7,
} as const;

export const DEFAULT_SUBSTITUTION_CONFIG = {
  formatName: API_CONFIG.FORMAT_NAME,
  schoolName: API_CONFIG.SCHOOL_NAME,
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
} as const;