export interface SubstitutionData {
  data: [string, string, string, string, string, string, string, string];
  group: string;
}

export interface ProcessedSubstitution {
  hours: string;
  time: string;
  group: string;
  subject: string;
  room: string;
  teacher: string;
  type: string;
  info: string;
  originalData: SubstitutionData;
}

export interface Category {
  key: string;
  label: string;
  priority: number;
  color: string;
}

export interface SampleData {
  sampleSubstitutions: SubstitutionData[];
  categories: Category[];
}

export type SubstitutionType = 
  | 'Entfall'
  | 'Raumänderung'
  | 'Vertretung'
  | 'Sondereinsatz'
  | 'EVA'
  | 'Klausur'
  | 'Freisetzung'
  | 'Sonstiges';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CalendarDate {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
}

export interface FilterState {
  search: string;
  categories: string[];
}

// WebUntis API Types
export interface WebUntisRequest {
  formatName: string;
  schoolName: string;
  date: number;
  dateOffset: number;
  activityTypeIds: number[];
  departmentElementType: number;
  departmentIds: number[];
  enableSubstitutionFrom: boolean;
  groupBy: number;
  hideAbsent: boolean;
  hideCancelCausedByEvent: boolean;
  hideCancelWithSubstitution: boolean;
  mergeBlocks: boolean;
  showAbsentElements: number[];
  showAbsentTeacher: boolean;
  showAffectedElements: number[];
  showBreakSupervisions: boolean;
  showCancel: boolean;
  showClass: boolean;
  showEvent: boolean;
  showExamSupervision: boolean;
  showHour: boolean;
  showInfo: boolean;
  showMessages: boolean;
  showOnlyCancel: boolean;
  showOnlyFutureSub: boolean;
  showRoom: boolean;
  showStudentgroup: boolean;
  showSubject: boolean;
  showSubstText: boolean;
  showSubstTypeColor: boolean;
  showSubstitutionFrom: number;
  showTeacher: boolean;
  showTeacherOnEvent: boolean;
  showTime: boolean;
  showUnheraldedExams: boolean;
  showUnitTime: boolean;
  strikethrough: boolean;
  strikethroughAbsentTeacher: boolean;
}

export interface WebUntisSubstitutionRow {
  data: [string, string, string, string, string, string, string, string];
  cssClasses: string[];
  cellClasses: Record<string, string[]>;
  group: string;
}

export interface WebUntisResponse {
  payload: {
    importInProgress: boolean;
    date: number;
    nextDate: number;
    showingNextDate: boolean;
    rows: WebUntisSubstitutionRow[];
    lastUpdate: string;
    absentElements: any;
    affectedElements: Record<string, string[]>;
    messageData: {
      messages: any[];
    };
    weekDay: string;
    regularFreeData: any;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
} 