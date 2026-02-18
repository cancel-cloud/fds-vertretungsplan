import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { __resetRateLimitStoreForTests } from '@/lib/security/rate-limit';

const userFindUniqueMock = vi.fn();
const userCountMock = vi.fn();
const userCreateMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
      count: userCountMock,
      create: userCreateMock,
    },
  },
}));

const buildRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const createUser = (overrides: Partial<{ email: string; role: 'USER' | 'ADMIN' }> = {}) => ({
  id: 'user-1',
  email: overrides.email ?? 'bootstrap@example.com',
  passwordHash: 'hashed-password',
  role: overrides.role ?? 'ADMIN',
  onboardingCompletedAt: null,
  onboardingSkippedAt: null,
  notificationsEnabled: false,
  notificationLookaheadSchoolDays: 1,
  createdAt: new Date('2026-02-18T10:00:00.000Z'),
  updatedAt: new Date('2026-02-18T10:00:00.000Z'),
});

describe('api/auth/register POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimitStoreForTests();
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_EMAILS = 'bootstrap@example.com';
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');

    userFindUniqueMock.mockResolvedValue(null);
    userCountMock.mockResolvedValue(0);
    userCreateMock.mockResolvedValue(createUser());
  });

  it('allows first registration only for the bootstrap admin email', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(
      buildRequest({
        email: 'bootstrap@example.com',
        password: 'very-secure-password',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.user.role).toBe('ADMIN');
    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'ADMIN',
          email: 'bootstrap@example.com',
        }),
      })
    );
  });

  it('fails closed when no bootstrap admin email is configured and no admin exists', async () => {
    process.env.ADMIN_EMAILS = '';

    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(
      buildRequest({
        email: 'first@example.com',
        password: 'very-secure-password',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(String(body.error)).toContain('ADMIN_EMAILS');
    expect(userCreateMock).not.toHaveBeenCalled();
  });

  it('rejects first registration for non-bootstrap email', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(
      buildRequest({
        email: 'other@example.com',
        password: 'very-secure-password',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(String(body.error)).toContain('Bootstrap-Admin');
    expect(userCreateMock).not.toHaveBeenCalled();
  });

  it('keeps signup open after at least one admin exists', async () => {
    userCountMock.mockResolvedValue(1);
    userCreateMock.mockResolvedValue(createUser({ email: 'new-user@example.com', role: 'USER' }));

    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(
      buildRequest({
        email: 'new-user@example.com',
        password: 'very-secure-password',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.user.role).toBe('USER');
  });

  it('enforces registration throttling with 429 and Retry-After', async () => {
    userCountMock.mockResolvedValue(1);
    userCreateMock.mockResolvedValue(createUser({ email: 'new-user@example.com', role: 'USER' }));
    const { POST } = await import('@/app/api/auth/register/route');

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(
        buildRequest({
          email: 'new-user@example.com',
          password: 'very-secure-password',
        })
      );
      expect(response.status).toBe(201);
    }

    const throttled = await POST(
      buildRequest({
        email: 'new-user@example.com',
        password: 'very-secure-password',
      })
    );
    const body = await throttled.json();

    expect(throttled.status).toBe(429);
    expect(String(body.error)).toContain('Zu viele Registrierungsversuche');
    expect(throttled.headers.get('Retry-After')).toBeTruthy();
  });
});
