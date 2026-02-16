import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const requireAdminMock = vi.fn();
const isDemoModeMock = vi.fn();
const userFindUniqueMock = vi.fn();
const appSettingsUpsertMock = vi.fn();
const generateDemoDatasetForUserMock = vi.fn();

vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock('@/lib/demo-config', () => ({
  isDemoMode: isDemoModeMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
    appSettings: {
      upsert: appSettingsUpsertMock,
    },
  },
}));

vi.mock('@/lib/demo-substitutions', () => {
  class DemoDatasetGenerationError extends Error {}

  return {
    DemoDatasetGenerationError,
    generateDemoDatasetForUser: generateDemoDatasetForUserMock,
  };
});

const createRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/admin/demo-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('api/admin/demo-data POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireAdminMock.mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' as const },
      response: null,
    });
    isDemoModeMock.mockReturnValue(true);
    userFindUniqueMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      timetableEntries: [
        {
          weekday: 'MON',
          startPeriod: 1,
          duration: 1,
          subjectCode: 'MAT',
          teacherCode: 'ABCD',
          room: 'R1',
          weekMode: 'ALL',
        },
      ],
    });
    generateDemoDatasetForUserMock.mockReturnValue({
      dataset: {
        version: 1,
        anchorDate: 20260216,
        startDate: 20260209,
        endDate: 20260223,
        generatedForUserId: 'user-1',
        generatedForEmail: 'user@example.com',
        generatedAt: '2026-02-16T12:00:00.000Z',
        days: {
          '20260216': [],
        },
      },
      guarantees: {
        todayMatches: 1,
        pastMatches: 1,
        futureMatches: 1,
      },
      selectedDates: {
        today: 20260216,
        past: 20260213,
        future: 20260217,
      },
    });
    appSettingsUpsertMock.mockResolvedValue({});
  });

  it('rejects request when not in demo mode', async () => {
    isDemoModeMock.mockReturnValue(false);

    const { POST } = await import('@/app/api/admin/demo-data/route');
    const response = await POST(createRequest({ userId: 'user-1' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('APP_MODE=demo');
  });

  it('returns 404 for unknown user', async () => {
    userFindUniqueMock.mockResolvedValue(null);

    const { POST } = await import('@/app/api/admin/demo-data/route');
    const response = await POST(createRequest({ userId: 'missing' }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toContain('nicht gefunden');
  });

  it('returns 400 when user has no timetable', async () => {
    userFindUniqueMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      timetableEntries: [],
    });

    const { POST } = await import('@/app/api/admin/demo-data/route');
    const response = await POST(createRequest({ userId: 'user-1' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('keinen Stundenplan');
  });

  it('stores generated demo dataset and returns summary', async () => {
    const { POST } = await import('@/app/api/admin/demo-data/route');
    const response = await POST(createRequest({ userId: 'user-1' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.generatedFor.email).toBe('user@example.com');
    expect(body.guarantees.todayMatches).toBe(1);
    expect(appSettingsUpsertMock).toHaveBeenCalledTimes(1);
  });
});
