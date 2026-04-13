import { User } from '@prisma/client';
import {
  AdminUserListItem,
  AdminUserNotificationStats,
  AdminUserSubscriptionStats,
  AuthUser,
  PushDeviceDto,
  PushSubscriptionsResponse,
} from '@/types/user-system';

const DEFAULT_DATE = new Date('2026-02-16T10:00:00.000Z');

export const createAuthUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: overrides.id ?? 'user-1',
  email: overrides.email ?? 'user@example.com',
  role: overrides.role ?? 'USER',
  onboardingCompletedAt: overrides.onboardingCompletedAt ?? null,
  onboardingSkippedAt: overrides.onboardingSkippedAt ?? null,
  notificationsEnabled: overrides.notificationsEnabled ?? false,
  notificationLookaheadSchoolDays: overrides.notificationLookaheadSchoolDays ?? 1,
});

interface CreateAdminUserListItemOverrides extends Partial<AdminUserListItem> {
  notificationStats?: AdminUserNotificationStats | null;
  subscriptionStats?: AdminUserSubscriptionStats | null;
}

export const createAdminUserListItem = (overrides: CreateAdminUserListItemOverrides = {}): AdminUserListItem => ({
  ...createAuthUser({
    id: overrides.id,
    email: overrides.email,
    role: overrides.role ?? 'USER',
    onboardingCompletedAt: overrides.onboardingCompletedAt,
    onboardingSkippedAt: overrides.onboardingSkippedAt,
    notificationsEnabled: overrides.notificationsEnabled,
    notificationLookaheadSchoolDays: overrides.notificationLookaheadSchoolDays,
  }),
  notificationStats: overrides.notificationStats ?? null,
  subscriptionStats: overrides.subscriptionStats ?? null,
  timetableCount: overrides.timetableCount ?? 0,
  pushSubscriptionCount: overrides.pushSubscriptionCount ?? 0,
  createdAt: overrides.createdAt ?? DEFAULT_DATE.toISOString(),
});

export const createUserRecord = (overrides: Partial<User> = {}): User => ({
  id: overrides.id ?? 'user-1',
  email: overrides.email ?? 'user@example.com',
  passwordHash: overrides.passwordHash ?? 'hashed-password',
  role: overrides.role ?? 'USER',
  onboardingCompletedAt: overrides.onboardingCompletedAt ?? null,
  onboardingSkippedAt: overrides.onboardingSkippedAt ?? null,
  notificationsEnabled: overrides.notificationsEnabled ?? false,
  notificationLookaheadSchoolDays: overrides.notificationLookaheadSchoolDays ?? 1,
  createdAt: overrides.createdAt ?? DEFAULT_DATE,
  updatedAt: overrides.updatedAt ?? DEFAULT_DATE,
});

export const createAdminUserRecord = (
  overrides: Partial<User> & { timetableEntries?: number; pushSubscriptions?: number } = {}
) => ({
  ...createUserRecord(overrides),
  _count: {
    timetableEntries: overrides.timetableEntries ?? 0,
    pushSubscriptions: overrides.pushSubscriptions ?? 0,
  },
});

export const createPushDeviceDto = (overrides: Partial<PushDeviceDto> = {}): PushDeviceDto => ({
  id: overrides.id ?? 'device-1',
  endpoint: overrides.endpoint ?? 'https://web.push.apple.com/example',
  userAgent: overrides.userAgent ?? 'Mozilla/5.0',
  createdAt: overrides.createdAt ?? DEFAULT_DATE.toISOString(),
  lastSeenAt: overrides.lastSeenAt ?? DEFAULT_DATE.toISOString(),
});

export const createPushDeviceRecord = (
  overrides: Partial<Omit<PushDeviceDto, 'createdAt' | 'lastSeenAt'>> & {
    createdAt?: Date;
    lastSeenAt?: Date;
  } = {}
) => ({
  id: overrides.id ?? 'device-1',
  endpoint: overrides.endpoint ?? 'https://web.push.apple.com/example',
  userAgent: overrides.userAgent ?? 'Mozilla/5.0',
  createdAt: overrides.createdAt ?? DEFAULT_DATE,
  lastSeenAt: overrides.lastSeenAt ?? DEFAULT_DATE,
});

export const createPushSubscriptionsResponse = (
  subscriptions: PushDeviceDto[] = [createPushDeviceDto()]
): PushSubscriptionsResponse => ({
  subscriptions,
});
