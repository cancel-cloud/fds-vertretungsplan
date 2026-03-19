import type { DefaultSession } from 'next-auth';

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

export type AuthSessionUser = NonNullable<DefaultSession['user']> & AuthUser;

export interface AuthTokenClaims {
  id: string;
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

export interface AdminUserNotificationStats {
  totalFingerprints: number;
  activeStates: number;
  lastSentAt: string | null;
  lastTargetDate: number | null;
}

export interface AdminUserSubscriptionStats {
  lastSeenAt: string | null;
  lastUpdatedAt: string | null;
}

export interface AdminUserListItem extends AuthUser {
  notificationStats: AdminUserNotificationStats | null;
  subscriptionStats: AdminUserSubscriptionStats | null;
  timetableCount: number;
  pushSubscriptionCount: number;
  createdAt: string;
}

export interface AdminUsersPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  users: AdminUserListItem[];
  pagination: AdminUsersPagination;
}

export interface AdminUserUpdateResponse {
  selfDemoted: boolean;
  user: AdminUserListItem;
}

export interface TeacherDto {
  id: string;
  code: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherDirectoryResponse {
  teachers: TeacherDto[];
  subjectCodes: string[];
}

export interface TeacherMutationResponse {
  teacher: TeacherDto;
}

export interface TeacherDeleteResponse {
  ok: true;
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

export interface PushDeviceDto {
  id: string;
  endpoint: string;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
}

export interface PushSubscriptionsResponse {
  subscriptions: PushDeviceDto[];
}
