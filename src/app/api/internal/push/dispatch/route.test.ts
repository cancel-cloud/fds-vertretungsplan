import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const sendPushMessageMock = vi.fn();
const getPushAppNameMock = vi.fn(() => 'FDS Vertretungsplan');
const isPushWindowMock = vi.fn(() => true);
const fetchUntisRowsMock = vi.fn();
const verifyQstashSignatureMock = vi.fn();

const userFindManyMock = vi.fn();
const notificationStateFindManyMock = vi.fn();
const notificationStateDeleteManyMock = vi.fn();
const notificationStateUpsertMock = vi.fn();
const notificationFingerprintCreateManyMock = vi.fn();
const pushSubscriptionDeleteManyMock = vi.fn();

vi.mock('@/lib/push', () => ({
  sendPushMessage: sendPushMessageMock,
  getPushAppName: getPushAppNameMock,
  isPushWindow: isPushWindowMock,
}));

vi.mock('@/lib/substitution-fetcher', () => ({
  fetchUntisRows: fetchUntisRowsMock,
  toUntisDateNumber: (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return Number.parseInt(`${year}${month}${day}`, 10);
  },
}));

vi.mock('@/lib/qstash', () => ({
  verifyQstashSignature: verifyQstashSignatureMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: userFindManyMock,
    },
    notificationState: {
      findMany: notificationStateFindManyMock,
      deleteMany: notificationStateDeleteManyMock,
      upsert: notificationStateUpsertMock,
    },
    notificationFingerprint: {
      createMany: notificationFingerprintCreateManyMock,
    },
    pushSubscription: {
      deleteMany: pushSubscriptionDeleteManyMock,
    },
  },
}));

const originalEnv = { ...process.env };

const createRow = (subject: string, teacher: string) => ({
  data: ['1', '07:45-08:30', '10A', subject, 'A101', teacher, 'Vertretung', ''],
  cssClasses: [],
  cellClasses: {},
  group: '10A',
});

const createUser = (options?: { includeDesktop?: boolean }) => ({
  id: 'user-1',
  email: 'lukas@devbrew.dev',
  notificationsEnabled: true,
  notificationLookaheadSchoolDays: 2,
  timetableEntries: [
    {
      id: 'entry-tue',
      weekday: 'TUE',
      startPeriod: 1,
      duration: 1,
      subjectCode: 'MAT',
      teacherCode: 'ABC',
      room: null,
      weekMode: 'ALL',
    },
    {
      id: 'entry-wed',
      weekday: 'WED',
      startPeriod: 1,
      duration: 1,
      subjectCode: 'MAT',
      teacherCode: 'ABC',
      room: null,
      weekMode: 'ALL',
    },
  ],
  pushSubscriptions: [
    ...(options?.includeDesktop
      ? [
          {
            endpoint: 'https://fcm.googleapis.com/fcm/send/desktop-1',
            p256dh: 'desktop-p256dh',
            auth: 'desktop-auth',
          },
        ]
      : []),
    {
      endpoint: 'https://web.push.apple.com/ios-endpoint-1',
      p256dh: 'ios-p256dh',
      auth: 'ios-auth',
    },
  ],
});

const createMondayOnlyUser = () => ({
  id: 'user-mon',
  email: 'demo@example.com',
  notificationsEnabled: true,
  notificationLookaheadSchoolDays: 1,
  timetableEntries: [
    {
      id: 'entry-mon',
      weekday: 'MON',
      startPeriod: 1,
      duration: 1,
      subjectCode: 'MAT',
      teacherCode: 'ABC',
      room: null,
      weekMode: 'ALL',
    },
  ],
  pushSubscriptions: [
    {
      endpoint: 'https://web.push.apple.com/ios-endpoint-1',
      p256dh: 'ios-p256dh',
      auth: 'ios-auth',
    },
  ],
});

const createRequest = (query: string) =>
  new NextRequest(`http://localhost/api/internal/push/dispatch${query}`, {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-secret',
      'Content-Type': 'application/json',
    },
  });

describe('api/internal/push/dispatch route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-16T10:00:00.000Z'));

    process.env = { ...originalEnv };
    process.env.PUSH_CRON_SECRET = 'test-secret';
    process.env.PUSH_INCLUDE_PAYLOAD = 'true';
    process.env.APP_TIMEZONE = 'Europe/Berlin';
    Object.assign(process.env, { NODE_ENV: 'test' });

    verifyQstashSignatureMock.mockResolvedValue(true);
    sendPushMessageMock.mockResolvedValue({ ok: true });
    notificationStateFindManyMock.mockResolvedValue([]);
    notificationStateDeleteManyMock.mockResolvedValue({ count: 0 });
    notificationStateUpsertMock.mockResolvedValue({});
    notificationFingerprintCreateManyMock.mockResolvedValue({ count: 0 });
    pushSubscriptionDeleteManyMock.mockResolvedValue({ count: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = { ...originalEnv };
  });

  it('force summary sends one push even when there are no relevant substitutions', async () => {
    userFindManyMock.mockResolvedValue([createUser()]);
    fetchUntisRowsMock.mockImplementation(async (date: Date) => ({
      date:
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate(),
      rows: [],
    }));

    const { POST } = await import('@/app/api/internal/push/dispatch/route');
    const response = await POST(
      createRequest('?force=1&sendUnchanged=1&userEmail=lukas@devbrew.dev&device=ios')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe('forced-summary');
    expect(body.notificationsSent).toBe(1);
    expect(body.summaryUsersSent).toBe(1);
    expect(body.summaryNoMatchUsers).toBe(1);
    expect(body.summaryTotalMatches).toBe(0);
    expect(sendPushMessageMock).toHaveBeenCalledTimes(1);
    expect(sendPushMessageMock.mock.calls[0][1]?.body).toContain('Keine relevanten Vertretungen');
  });

  it('force summary sends one aggregated push with total match count', async () => {
    userFindManyMock.mockResolvedValue([createUser()]);
    fetchUntisRowsMock.mockImplementation(async (date: Date) => ({
      date:
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate(),
      rows: [createRow('MAT', 'ABC')],
    }));

    const { POST } = await import('@/app/api/internal/push/dispatch/route');
    const response = await POST(createRequest('?force=1&sendUnchanged=1&device=ios'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe('forced-summary');
    expect(body.notificationsSent).toBe(1);
    expect(body.summaryTotalMatches).toBe(2);
    expect(sendPushMessageMock).toHaveBeenCalledTimes(1);
    expect(sendPushMessageMock.mock.calls[0][1]?.body).toContain('Du hast 2 relevante Vertretung');
  });

  it('force summary in demo mode includes today in lookahead window', async () => {
    process.env.APP_MODE = 'demo';
    userFindManyMock.mockResolvedValue([createMondayOnlyUser()]);
    fetchUntisRowsMock.mockImplementation(async (date: Date) => ({
      date:
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate(),
      rows: [createRow('MAT', 'ABC')],
    }));

    const { POST } = await import('@/app/api/internal/push/dispatch/route');
    const response = await POST(createRequest('?force=1&sendUnchanged=1&device=ios'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe('forced-summary');
    expect(body.summaryTotalMatches).toBe(1);
    expect(body.summaryNoMatchUsers).toBe(0);
    expect(sendPushMessageMock).toHaveBeenCalledTimes(1);
    expect(sendPushMessageMock.mock.calls[0][1]?.url).toContain('date=20260216');
  });

  it('force summary with device=ios only targets apple endpoints', async () => {
    userFindManyMock.mockResolvedValue([createUser({ includeDesktop: true })]);
    fetchUntisRowsMock.mockImplementation(async (date: Date) => ({
      date:
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate(),
      rows: [],
    }));

    const { POST } = await import('@/app/api/internal/push/dispatch/route');
    const response = await POST(createRequest('?force=1&sendUnchanged=1&device=ios'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.notificationsSent).toBe(1);
    expect(sendPushMessageMock).toHaveBeenCalledTimes(1);
    expect(sendPushMessageMock.mock.calls[0][0].endpoint).toContain('web.push.apple.com');
  });

  it('force summary does not mutate notification state tables', async () => {
    userFindManyMock.mockResolvedValue([createUser()]);
    fetchUntisRowsMock.mockImplementation(async (date: Date) => ({
      date:
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate(),
      rows: [],
    }));

    const { POST } = await import('@/app/api/internal/push/dispatch/route');
    const response = await POST(createRequest('?force=1&sendUnchanged=1&device=ios'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe('forced-summary');
    expect(notificationStateFindManyMock).not.toHaveBeenCalled();
    expect(notificationStateDeleteManyMock).not.toHaveBeenCalled();
    expect(notificationStateUpsertMock).not.toHaveBeenCalled();
    expect(notificationFingerprintCreateManyMock).not.toHaveBeenCalled();
  });

  it('keeps delta mode behavior unchanged when sendUnchanged is not set', async () => {
    userFindManyMock.mockResolvedValue([createUser()]);
    fetchUntisRowsMock.mockImplementation(async (date: Date) => ({
      date:
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate(),
      rows: [],
    }));

    const { POST } = await import('@/app/api/internal/push/dispatch/route');
    const response = await POST(createRequest('?force=1&userEmail=lukas@devbrew.dev&device=ios'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe('delta');
    expect(body.notificationsSent).toBe(0);
    expect(body.skippedUnchanged).toBe(2);
    expect(sendPushMessageMock).not.toHaveBeenCalled();
    expect(notificationStateFindManyMock).toHaveBeenCalledTimes(1);
  });
});
