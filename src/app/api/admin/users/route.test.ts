import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const requireAdminMock = vi.fn();
const transactionMock = vi.fn();
const txUserFindUniqueMock = vi.fn();
const txUserCountMock = vi.fn();
const txUserUpdateMock = vi.fn();

vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

const createAuthAdmin = (id = 'admin-actor') => ({
  id,
  role: 'ADMIN' as const,
});

const createUpdatedUser = (overrides: Partial<{ id: string; email: string; role: 'USER' | 'ADMIN' }> = {}) => ({
  id: overrides.id ?? 'target-user',
  email: overrides.email ?? 'target@example.com',
  role: overrides.role ?? 'USER',
  onboardingCompletedAt: null,
  onboardingSkippedAt: null,
  notificationsEnabled: false,
  notificationLookaheadSchoolDays: 1,
  createdAt: new Date('2026-02-16T10:00:00.000Z'),
  _count: {
    timetableEntries: 0,
    pushSubscriptions: 0,
  },
});

const buildPatchRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('api/admin/users PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireAdminMock.mockResolvedValue({
      user: createAuthAdmin(),
      response: null,
    });

    transactionMock.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        user: {
          findUnique: txUserFindUniqueMock,
          count: txUserCountMock,
          update: txUserUpdateMock,
        },
      })
    );

    txUserFindUniqueMock.mockResolvedValue({
      role: 'ADMIN',
      email: 'target@example.com',
    });
    txUserCountMock.mockResolvedValue(2);
    txUserUpdateMock.mockResolvedValue(createUpdatedUser());
  });

  it('returns 400 for ADMIN -> USER without confirmationEmail', async () => {
    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(buildPatchRequest({ id: 'target-user', role: 'USER' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Bestätigungs-E-Mail stimmt nicht mit dem Zielkonto überein.');
    expect(txUserUpdateMock).not.toHaveBeenCalled();
  });

  it('returns 400 for ADMIN -> USER with wrong confirmationEmail', async () => {
    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildPatchRequest({ id: 'target-user', role: 'USER', confirmationEmail: 'wrong@example.com' })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Bestätigungs-E-Mail stimmt nicht mit dem Zielkonto überein.');
    expect(txUserUpdateMock).not.toHaveBeenCalled();
  });

  it('updates ADMIN -> USER with matching confirmationEmail', async () => {
    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildPatchRequest({ id: 'target-user', role: 'USER', confirmationEmail: ' Target@Example.com ' })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.selfDemoted).toBe(false);
    expect(body.user.role).toBe('USER');
    expect(txUserUpdateMock).toHaveBeenCalledTimes(1);
  });

  it('returns selfDemoted=true for self ADMIN -> USER', async () => {
    requireAdminMock.mockResolvedValue({
      user: createAuthAdmin('target-user'),
      response: null,
    });
    txUserUpdateMock.mockResolvedValue(createUpdatedUser({ id: 'target-user', role: 'USER' }));

    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildPatchRequest({ id: 'target-user', role: 'USER', confirmationEmail: 'target@example.com' })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.selfDemoted).toBe(true);
  });

  it('keeps last-admin protection active', async () => {
    txUserCountMock.mockResolvedValue(1);

    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildPatchRequest({ id: 'target-user', role: 'USER', confirmationEmail: 'target@example.com' })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Der letzte Admin kann nicht herabgestuft werden.');
    expect(txUserUpdateMock).not.toHaveBeenCalled();
  });

  it('allows USER -> ADMIN without confirmationEmail', async () => {
    txUserFindUniqueMock.mockResolvedValue({
      role: 'USER',
      email: 'target@example.com',
    });
    txUserUpdateMock.mockResolvedValue(createUpdatedUser({ role: 'ADMIN' }));

    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(buildPatchRequest({ id: 'target-user', role: 'ADMIN' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.role).toBe('ADMIN');
    expect(body.selfDemoted).toBe(false);
    expect(txUserUpdateMock).toHaveBeenCalledTimes(1);
  });
});
