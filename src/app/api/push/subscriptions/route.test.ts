import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const requireUserMock = vi.fn();
const pushSubscriptionFindManyMock = vi.fn();

vi.mock('@/lib/auth/guards', () => ({
  requireUser: requireUserMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pushSubscription: {
      findMany: pushSubscriptionFindManyMock,
    },
  },
}));

describe('api/push/subscriptions GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized response when user is not authenticated', async () => {
    requireUserMock.mockResolvedValue({
      user: null,
      response: NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 }),
    });

    const { GET } = await import('@/app/api/push/subscriptions/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Nicht angemeldet.');
    expect(pushSubscriptionFindManyMock).not.toHaveBeenCalled();
  });

  it('returns push subscriptions for current user', async () => {
    requireUserMock.mockResolvedValue({
      user: { id: 'user-1' },
      response: null,
    });
    pushSubscriptionFindManyMock.mockResolvedValue([
      {
        id: 'sub-1',
        endpoint: 'https://web.push.apple.com/example',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        createdAt: new Date('2026-02-14T08:00:00.000Z'),
        lastSeenAt: new Date('2026-02-16T07:30:00.000Z'),
      },
    ]);

    const { GET } = await import('@/app/api/push/subscriptions/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.subscriptions)).toBe(true);
    expect(body.subscriptions).toHaveLength(1);
    expect(body.subscriptions[0].id).toBe('sub-1');
    expect(pushSubscriptionFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { lastSeenAt: 'desc' },
      })
    );
  });
});
