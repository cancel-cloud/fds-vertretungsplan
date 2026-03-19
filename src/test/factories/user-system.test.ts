import { describe, expect, it } from 'vitest';
import {
  createAdminUserListItem,
  createAdminUserRecord,
  createAuthUser,
  createPushDeviceDto,
  createPushDeviceRecord,
  createPushSubscriptionsResponse,
  createUserRecord,
} from '@/test/factories/user-system';

describe('user-system factories', () => {
  it('builds an auth user with overrides', () => {
    const user = createAuthUser({
      id: 'user-2',
      email: 'test@example.com',
      notificationsEnabled: true,
    });

    expect(user.id).toBe('user-2');
    expect(user.email).toBe('test@example.com');
    expect(user.notificationsEnabled).toBe(true);
  });

  it('builds an admin user list item with stats', () => {
    const item = createAdminUserListItem({
      id: 'admin-1',
      notificationStats: {
        totalFingerprints: 4,
        activeStates: 2,
        lastSentAt: '2026-02-16T08:00:00.000Z',
        lastTargetDate: 20260216,
      },
    });

    expect(item.id).toBe('admin-1');
    expect(item.notificationStats?.totalFingerprints).toBe(4);
    expect(item.subscriptionStats).toBeNull();
  });

  it('builds a prisma-style admin user record', () => {
    const record = createAdminUserRecord({
      id: 'admin-2',
      timetableEntries: 2,
      pushSubscriptions: 3,
    });

    expect(record.id).toBe('admin-2');
    expect(record._count.timetableEntries).toBe(2);
    expect(record._count.pushSubscriptions).toBe(3);
  });

  it('builds a push subscriptions response', () => {
    const response = createPushSubscriptionsResponse([
      createPushDeviceDto({ id: 'device-1' }),
    ]);

    expect(response.subscriptions).toHaveLength(1);
    expect(response.subscriptions[0].id).toBe('device-1');
  });

  it('builds a prisma-style push device record', () => {
    const record = createPushDeviceRecord({ id: 'device-2' });

    expect(record.id).toBe('device-2');
    expect(record.createdAt).toBeInstanceOf(Date);
  });

  it('builds a prisma user record', () => {
    const user = createUserRecord({ email: 'record@example.com' });

    expect(user.email).toBe('record@example.com');
    expect(user.createdAt).toBeInstanceOf(Date);
  });
});
