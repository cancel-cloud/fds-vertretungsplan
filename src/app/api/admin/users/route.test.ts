import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildJsonRequest } from '@/test/http';
import { createAdminUserRecord, createAuthUser } from '@/test/factories/user-system';

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

describe('api/admin/users PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireAdminMock.mockResolvedValue({
      user: createAuthUser({ id: 'admin-actor', role: 'ADMIN' }),
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
    txUserUpdateMock.mockResolvedValue(createAdminUserRecord({ id: 'target-user', email: 'target@example.com', role: 'USER' }));
  });

  it('returns 400 for ADMIN -> USER without confirmationEmail', async () => {
    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(buildJsonRequest('http://localhost/api/admin/users', { id: 'target-user', role: 'USER' }, { method: 'PATCH' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Bestätigungs-E-Mail stimmt nicht mit dem Zielkonto überein.');
    expect(txUserUpdateMock).not.toHaveBeenCalled();
  });

  it('returns 400 for ADMIN -> USER with wrong confirmationEmail', async () => {
    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildJsonRequest('http://localhost/api/admin/users', { id: 'target-user', role: 'USER', confirmationEmail: 'wrong@example.com' }, { method: 'PATCH' })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Bestätigungs-E-Mail stimmt nicht mit dem Zielkonto überein.');
    expect(txUserUpdateMock).not.toHaveBeenCalled();
  });

  it('updates ADMIN -> USER with matching confirmationEmail', async () => {
    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildJsonRequest('http://localhost/api/admin/users', { id: 'target-user', role: 'USER', confirmationEmail: ' Target@Example.com ' }, { method: 'PATCH' })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.selfDemoted).toBe(false);
    expect(body.user.role).toBe('USER');
    expect(txUserUpdateMock).toHaveBeenCalledTimes(1);
  });

  it('returns selfDemoted=true for self ADMIN -> USER', async () => {
    requireAdminMock.mockResolvedValue({
      user: createAuthUser({ id: 'target-user', role: 'ADMIN' }),
      response: null,
    });
    txUserUpdateMock.mockResolvedValue(createAdminUserRecord({ id: 'target-user', email: 'target@example.com', role: 'USER' }));

    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildJsonRequest('http://localhost/api/admin/users', { id: 'target-user', role: 'USER', confirmationEmail: 'target@example.com' }, { method: 'PATCH' })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.selfDemoted).toBe(true);
  });

  it('keeps last-admin protection active', async () => {
    txUserCountMock.mockResolvedValue(1);

    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildJsonRequest('http://localhost/api/admin/users', { id: 'target-user', role: 'USER', confirmationEmail: 'target@example.com' }, { method: 'PATCH' })
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
    txUserUpdateMock.mockResolvedValue(createAdminUserRecord({ id: 'target-user', email: 'target@example.com', role: 'ADMIN' }));

    const { PATCH } = await import('@/app/api/admin/users/route');
    const response = await PATCH(
      buildJsonRequest('http://localhost/api/admin/users', { id: 'target-user', role: 'ADMIN' }, { method: 'PATCH' })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.role).toBe('ADMIN');
    expect(body.selfDemoted).toBe(false);
    expect(txUserUpdateMock).toHaveBeenCalledTimes(1);
  });
});
