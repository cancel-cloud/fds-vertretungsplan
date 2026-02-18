import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { __resetRateLimitStoreForTests } from '@/lib/security/rate-limit';

const { userFindUniqueMock } = vi.hoisted(() => ({
  userFindUniqueMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
  },
}));

const createUser = () => ({
  id: 'user-1',
  email: 'lukas@devbrew.dev',
  passwordHash: 'hashed-password',
  role: 'USER' as const,
  onboardingCompletedAt: null,
  onboardingSkippedAt: null,
  notificationsEnabled: false,
  notificationLookaheadSchoolDays: 1,
  createdAt: new Date('2026-02-18T10:00:00.000Z'),
  updatedAt: new Date('2026-02-18T10:00:00.000Z'),
});

const getAuthorize = async () => {
  const { authOptions } = await import('@/lib/auth');
  const provider = authOptions.providers.find((candidate) => candidate.id === 'credentials');
  const authorize = (provider as { options?: { authorize?: unknown } } | undefined)?.options?.authorize;
  if (typeof authorize !== 'function') {
    throw new Error('Credentials authorize handler is not available.');
  }
  return authorize as (credentials: { email: string; password: string }, requestLike: unknown) => Promise<unknown>;
};

describe('auth login throttling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimitStoreForTests();
    userFindUniqueMock.mockResolvedValue(createUser());
  });

  it('throttles repeated login attempts per email+ip after threshold', async () => {
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    const authorize = await getAuthorize();

    for (let index = 0; index < 8; index += 1) {
      const result = await authorize(
        { email: 'lukas@devbrew.dev', password: 'wrong-password' },
        { headers: { 'x-forwarded-for': '203.0.113.15' } }
      );
      expect(result).toBeNull();
    }

    const throttledResult = await authorize(
      { email: 'lukas@devbrew.dev', password: 'wrong-password' },
      { headers: { 'x-forwarded-for': '203.0.113.15' } }
    );
    expect(throttledResult).toBeNull();
    expect(userFindUniqueMock).toHaveBeenCalledTimes(8);
  });

  it('resets email+ip limiter after a successful login', async () => {
    const compareMock = vi.spyOn(bcrypt, 'compare');
    compareMock.mockImplementation(async (plain: string) => plain === 'correct-password');
    const authorize = await getAuthorize();
    const requestLike = { headers: { 'x-forwarded-for': '203.0.113.15' } };

    for (let index = 0; index < 7; index += 1) {
      const result = await authorize({ email: 'lukas@devbrew.dev', password: 'wrong-password' }, requestLike);
      expect(result).toBeNull();
    }

    const success = await authorize({ email: 'lukas@devbrew.dev', password: 'correct-password' }, requestLike);
    expect(success).toBeTruthy();

    for (let index = 0; index < 8; index += 1) {
      const result = await authorize({ email: 'lukas@devbrew.dev', password: 'wrong-password' }, requestLike);
      expect(result).toBeNull();
    }

    expect(userFindUniqueMock).toHaveBeenCalledTimes(16);
  });
});
