export type AuthRole = 'USER' | 'ADMIN';

export type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

export type WeekMode = 'ALL' | 'EVEN' | 'ODD';
export type LessonDuration = 1 | 2 | 3 | 4;

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  onboardingCompletedAt: string | null;
  onboardingSkippedAt: string | null;
  notificationsEnabled: boolean;
  notificationLookaheadSchoolDays: number;
}

export interface UserSettingsDto {
  notificationsEnabled: boolean;
  notificationLookaheadSchoolDays: number;
}

export interface TeacherDto {
  id: string;
  code: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntryDto {
  id: string;
  userId: string;
  weekday: Weekday;
  startPeriod: number;
  duration: LessonDuration;
  subjectCode: string;
  teacherCode: string;
  room: string | null;
  weekMode: WeekMode;
  teacherId: string | null;
  teacherFullName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimetablePresetDto {
  id: string;
  userId: string;
  subjectCode: string;
  teacherCode: string;
  room: string | null;
  usageCount: number;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntryInput {
  weekday: Weekday;
  startPeriod: number;
  duration: LessonDuration;
  subjectCode: string;
  teacherCode: string;
  room?: string | null;
  weekMode: WeekMode;
}

export interface PushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
