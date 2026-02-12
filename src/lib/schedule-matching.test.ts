import { describe, expect, it } from 'vitest';
import { matchSubstitutionToEntry, parsePeriodsFromHours } from '@/lib/schedule-matching';
import { appliesToWeekMode, isIsoWeekEven, validateTimetableEntries } from '@/lib/timetable';
import { ProcessedSubstitution } from '@/types';

const makeSubstitution = (hours: string, subject = 'MATH', teacher = 'TUMM'): ProcessedSubstitution => ({
  hours,
  time: '',
  group: '11A',
  subject,
  room: '212',
  teacher,
  type: 'Vertretung',
  info: '',
  originalData: {
    data: ['', '', '', '', '', '', '', ''],
    group: '11A',
  },
});

describe('parsePeriodsFromHours', () => {
  it('parses single hour values', () => {
    expect(parsePeriodsFromHours('3')).toEqual([3]);
  });

  it('parses ranges with separators', () => {
    expect(parsePeriodsFromHours('1 - 2')).toEqual([1, 2]);
    expect(parsePeriodsFromHours('9-10')).toEqual([9, 10]);
  });
});

describe('week parity', () => {
  it('detects even and odd ISO weeks', () => {
    const evenWeekDate = new Date(2026, 0, 7);
    const oddWeekDate = new Date(2026, 0, 14);

    expect(isIsoWeekEven(evenWeekDate)).toBe(true);
    expect(isIsoWeekEven(oddWeekDate)).toBe(false);
  });

  it('applies week mode', () => {
    const evenWeekDate = new Date(2026, 0, 7);
    const oddWeekDate = new Date(2026, 0, 14);

    expect(appliesToWeekMode('ALL', evenWeekDate)).toBe(true);
    expect(appliesToWeekMode('EVEN', evenWeekDate)).toBe(true);
    expect(appliesToWeekMode('EVEN', oddWeekDate)).toBe(false);
    expect(appliesToWeekMode('ODD', oddWeekDate)).toBe(true);
  });
});

describe('matching and conflict validation', () => {
  it('matches by day, overlap and subject or teacher', () => {
    const substitution = makeSubstitution('5-6', 'MATH', 'OTHER');

    const match = matchSubstitutionToEntry(
      substitution,
      {
        weekday: 'WED',
        startPeriod: 5,
        duration: 2,
        subjectCode: 'MATH',
        teacherCode: 'TUMM',
        room: '212',
        weekMode: 'ALL',
      },
      new Date(2026, 0, 7)
    );

    expect(match).not.toBeNull();
    expect(match?.subjectMatch).toBe(true);
    expect(match?.teacherMatch).toBe(false);
  });

  it('rejects overlapping entries with same week applicability', () => {
    expect(() =>
      validateTimetableEntries([
        {
          weekday: 'MON',
          startPeriod: 3,
          duration: 2,
          subjectCode: 'MATH',
          teacherCode: 'TUMM',
          room: '212',
          weekMode: 'ALL',
        },
        {
          weekday: 'MON',
          startPeriod: 4,
          duration: 1,
          subjectCode: 'DEUT',
          teacherCode: 'SIMC',
          room: '064',
          weekMode: 'EVEN',
        },
      ])
    ).toThrowError(/Konflikt/);
  });

  it('allows overlap when week modes do not overlap', () => {
    expect(() =>
      validateTimetableEntries([
        {
          weekday: 'THU',
          startPeriod: 7,
          duration: 2,
          subjectCode: 'ITEC',
          teacherCode: 'HITI',
          room: 'A1-08',
          weekMode: 'ODD',
        },
        {
          weekday: 'THU',
          startPeriod: 7,
          duration: 2,
          subjectCode: 'PRIN',
          teacherCode: 'ROHA',
          room: 'A1-10',
          weekMode: 'EVEN',
        },
      ])
    ).not.toThrow();
  });
});
