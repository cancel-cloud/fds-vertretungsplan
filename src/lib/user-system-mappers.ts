import { TeacherDirectory, TimetableEntry, TimetablePreset, User } from '@prisma/client';
import { AuthUser, LessonDuration, TeacherDto, TimetableEntryDto, TimetablePresetDto } from '@/types/user-system';

export const toAuthUserDto = (user: User): AuthUser => ({
  id: user.id,
  email: user.email,
  role: user.role,
  onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
  onboardingSkippedAt: user.onboardingSkippedAt?.toISOString() ?? null,
  notificationsEnabled: user.notificationsEnabled,
  notificationLookaheadSchoolDays: user.notificationLookaheadSchoolDays,
});

export const toTeacherDto = (teacher: TeacherDirectory): TeacherDto => ({
  id: teacher.id,
  code: teacher.code,
  fullName: teacher.fullName,
  isActive: teacher.isActive,
  createdAt: teacher.createdAt.toISOString(),
  updatedAt: teacher.updatedAt.toISOString(),
});

export const toTimetableEntryDto = (
  entry: TimetableEntry & { teacher: { fullName: string } | null }
): TimetableEntryDto => ({
  id: entry.id,
  userId: entry.userId,
  weekday: entry.weekday,
  startPeriod: entry.startPeriod,
  duration: entry.duration as LessonDuration,
  subjectCode: entry.subjectCode,
  teacherCode: entry.teacherCode,
  room: entry.room,
  weekMode: entry.weekMode,
  teacherId: entry.teacherId,
  teacherFullName: entry.teacher?.fullName ?? null,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
});

export const toTimetablePresetDto = (preset: TimetablePreset): TimetablePresetDto => ({
  id: preset.id,
  userId: preset.userId,
  subjectCode: preset.subjectCode,
  teacherCode: preset.teacherCode,
  room: preset.room.length > 0 ? preset.room : null,
  usageCount: preset.usageCount,
  lastUsedAt: preset.lastUsedAt.toISOString(),
  createdAt: preset.createdAt.toISOString(),
  updatedAt: preset.updatedAt.toISOString(),
});
