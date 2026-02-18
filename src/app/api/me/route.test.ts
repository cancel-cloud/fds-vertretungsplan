import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const requireUserMock = vi.fn();
const userUpdateMock = vi.fn();
const enforceSameOriginMock = vi.fn();

vi.mock('@/lib/auth/guards', () => ({
  requireUser: requireUserMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: userUpdateMock,
    },
  },
}));

vi.mock('@/lib/security/request-integrity', () => ({
  enforceSameOrigin: enforceSameOriginMock,
}));

const createAuthUser = () => ({
  id: 'user-1',
  email: 'lukas@devbrew.dev',
  passwordHash: 'hash',
  role: 'USER' as const,
  onboardingCompletedAt: null,
  onboardingSkippedAt: null,
  notificationsEnabled: true,
  notificationLookaheadSchoolDays: 1,
  createdAt: new Date('2026-02-11T12:00:00.000Z'),
  updatedAt: new Date('2026-02-11T12:00:00.000Z'),
});

describe('api/me PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enforceSameOriginMock.mockReturnValue(null);
    requireUserMock.mockResolvedValue({ user: createAuthUser(), response: null });
    userUpdateMock.mockResolvedValue({
      ...createAuthUser(),
      notificationLookaheadSchoolDays: 3,
    });
  });

  it('updates lookahead in valid range', async () => {
    const { PUT } = await import('@/app/api/me/route');
    const request = new NextRequest('http://localhost/api/me', {
      method: 'PUT',
      body: JSON.stringify({ notificationLookaheadSchoolDays: 3 }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.notificationLookaheadSchoolDays).toBe(3);
    expect(userUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({ notificationLookaheadSchoolDays: 3 }),
      })
    );
  });

  it('rejects lookahead outside range', async () => {
    const { PUT } = await import('@/app/api/me/route');
    const request = new NextRequest('http://localhost/api/me', {
      method: 'PUT',
      body: JSON.stringify({ notificationLookaheadSchoolDays: 0 }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(String(body.error)).toContain('zwischen 1 und 5');
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it('returns 403 when same-origin check fails', async () => {
    enforceSameOriginMock.mockReturnValueOnce(new Response(JSON.stringify({ error: 'Ungültige Request-Herkunft.' }), { status: 403 }));

    const { PUT } = await import('@/app/api/me/route');
    const request = new NextRequest('https://app.example/api/me', {
      method: 'PUT',
      body: JSON.stringify({ notificationLookaheadSchoolDays: 3 }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Ungültige Request-Herkunft.');
    expect(requireUserMock).not.toHaveBeenCalled();
  });
});
