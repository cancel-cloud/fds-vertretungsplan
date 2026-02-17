import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireUserMock = vi.fn();
const teacherDirectoryFindManyMock = vi.fn();
const timetableEntryFindManyMock = vi.fn();
const timetablePresetFindManyMock = vi.fn();
const userUpdateMock = vi.fn();
const transactionMock = vi.fn();
const txTimetableEntryDeleteManyMock = vi.fn();
const txTimetableEntryCreateManyMock = vi.fn();
const txUserUpdateMock = vi.fn();
const txTimetablePresetUpsertMock = vi.fn();

vi.mock('@/lib/auth/guards', () => ({
  requireUser: requireUserMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    teacherDirectory: {
      findMany: teacherDirectoryFindManyMock,
    },
    timetableEntry: {
      findMany: timetableEntryFindManyMock,
    },
    timetablePreset: {
      findMany: timetablePresetFindManyMock,
    },
    user: {
      update: userUpdateMock,
    },
    $transaction: transactionMock,
  },
}));

const buildPutRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/timetable', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('api/timetable PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireUserMock.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: 'USER' as const,
        onboardingCompletedAt: null,
        onboardingSkippedAt: null,
        notificationsEnabled: true,
        notificationLookaheadSchoolDays: 1,
        createdAt: new Date('2026-02-16T10:00:00.000Z'),
        updatedAt: new Date('2026-02-16T10:00:00.000Z'),
      },
      response: null,
    });

    teacherDirectoryFindManyMock.mockResolvedValue([{ id: 'teacher-1', code: 'ROHA' }]);
    timetableEntryFindManyMock.mockResolvedValue([
      {
        id: 'entry-1',
        userId: 'user-1',
        weekday: 'MON',
        startPeriod: 1,
        duration: 1,
        subjectCode: 'MATH',
        teacherCode: 'ROHA',
        room: 'R1',
        weekMode: 'ALL',
        teacherId: 'teacher-1',
        teacher: { fullName: 'Rohal Name' },
        createdAt: new Date('2026-02-16T10:00:00.000Z'),
        updatedAt: new Date('2026-02-16T10:00:00.000Z'),
      },
    ]);
    timetablePresetFindManyMock.mockResolvedValue([]);

    transactionMock.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        timetableEntry: {
          deleteMany: txTimetableEntryDeleteManyMock,
          createMany: txTimetableEntryCreateManyMock,
        },
        user: {
          update: txUserUpdateMock,
        },
        timetablePreset: {
          upsert: txTimetablePresetUpsertMock,
        },
      })
    );
  });

  it('rejects overlapping entries in strict mode', async () => {
    const { PUT } = await import('@/app/api/timetable/route');
    const response = await PUT(
      buildPutRequest({
        entries: [
          {
            weekday: 'MON',
            startPeriod: 1,
            duration: 2,
            subjectCode: 'MATH',
            teacherCode: 'ROHA',
            room: 'R1',
            weekMode: 'ALL',
          },
          {
            weekday: 'MON',
            startPeriod: 2,
            duration: 1,
            subjectCode: 'ENGL',
            teacherCode: 'ABCD',
            room: 'R2',
            weekMode: 'ALL',
          },
        ],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(String(body.error)).toContain('Konflikt');
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('saves overlapping entries when allowOverlaps=true', async () => {
    const { PUT } = await import('@/app/api/timetable/route');
    const response = await PUT(
      buildPutRequest({
        allowOverlaps: true,
        entries: [
          {
            weekday: 'MON',
            startPeriod: 1,
            duration: 2,
            subjectCode: 'MATH',
            teacherCode: 'ROHA',
            room: 'R1',
            weekMode: 'ALL',
          },
          {
            weekday: 'MON',
            startPeriod: 2,
            duration: 1,
            subjectCode: 'ENGL',
            teacherCode: 'ABCD',
            room: 'R2',
            weekMode: 'ALL',
          },
        ],
      })
    );

    expect(response.status).toBe(200);
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(txTimetableEntryCreateManyMock).toHaveBeenCalledTimes(1);
  });
});
