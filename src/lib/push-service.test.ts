import { describe, expect, it, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  pushSubscription: {
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  notificationState: {
    findFirst: vi.fn(),
  },
  notificationFingerprint: {
    findFirst: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('push service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts push subscriptions with last seen metadata', async () => {
    const { savePushSubscription } = await import('@/lib/push-service');

    await savePushSubscription({
      userId: 'user-1',
      endpoint: 'https://web.push.apple.com/example',
      p256dh: 'p256dh',
      auth: 'auth',
      userAgent: 'Mozilla/5.0',
    });

    const call = prismaMock.pushSubscription.upsert.mock.calls[0]?.[0] as {
      where: { endpoint: string };
      create: { userId: string; endpoint: string; p256dh: string; auth: string; userAgent: string | null; lastSeenAt: Date };
      update: { userId: string; endpoint?: string; p256dh: string; auth: string; userAgent: string | null; lastSeenAt: Date };
    };

    expect(call.where).toEqual({ endpoint: 'https://web.push.apple.com/example' });
    expect(call.create).toMatchObject({
      userId: 'user-1',
      endpoint: 'https://web.push.apple.com/example',
      p256dh: 'p256dh',
      auth: 'auth',
      userAgent: 'Mozilla/5.0',
    });
    expect(call.create.lastSeenAt).toBeInstanceOf(Date);
    expect(call.update).toMatchObject({
      userId: 'user-1',
      p256dh: 'p256dh',
      auth: 'auth',
      userAgent: 'Mozilla/5.0',
    });
    expect(call.update.lastSeenAt).toBeInstanceOf(Date);
  });

  it('disables notifications when the last push subscription is removed', async () => {
    const { removePushSubscriptionForUser } = await import('@/lib/push-service');

    prismaMock.pushSubscription.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.pushSubscription.count.mockResolvedValue(0);

    const result = await removePushSubscriptionForUser('user-1', 'https://web.push.apple.com/example');

    expect(result.remainingSubscriptions).toBe(0);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { notificationsEnabled: false },
    });
  });

  it('prefers notification state when resolving the last target', async () => {
    const { getLastPushTarget } = await import('@/lib/push-service');

    prismaMock.notificationState.findFirst.mockResolvedValue({
      targetDate: 20260216,
      lastSentAt: new Date('2026-02-16T07:30:00.000Z'),
    });

    const result = await getLastPushTarget('user-1');

    expect(result).toEqual({
      targetDate: 20260216,
      sentAt: '2026-02-16T07:30:00.000Z',
      url: '/stundenplan/dashboard?date=20260216',
    });
    expect(prismaMock.notificationFingerprint.findFirst).not.toHaveBeenCalled();
  });
});
