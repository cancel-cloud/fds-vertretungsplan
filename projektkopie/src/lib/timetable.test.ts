import { describe, expect, it } from 'vitest';
import { findTimetableConflicts, validateTimetableEntries } from '@/lib/timetable';

describe('timetable validation', () => {
  it('accepts durations between 1 and 4', () => {
    const result = validateTimetableEntries([
      {
        weekday: 'MON',
        startPeriod: 1,
        duration: 4,
        subjectCode: 'MATH',
        teacherCode: 'ROHA',
        room: 'R1',
        weekMode: 'ALL',
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].duration).toBe(4);
  });

  it('rejects duration outside 1..4', () => {
    expect(() =>
      validateTimetableEntries([
        {
          weekday: 'MON',
          startPeriod: 1,
          duration: 0,
          subjectCode: 'MATH',
          teacherCode: 'ROHA',
          room: 'R1',
          weekMode: 'ALL',
        },
      ])
    ).toThrow('zwischen 1 und 4');

    expect(() =>
      validateTimetableEntries([
        {
          weekday: 'MON',
          startPeriod: 1,
          duration: 5,
          subjectCode: 'MATH',
          teacherCode: 'ROHA',
          room: 'R1',
          weekMode: 'ALL',
        },
      ])
    ).toThrow('zwischen 1 und 4');
  });

  it('rejects overlaps in strict mode', () => {
    expect(() =>
      validateTimetableEntries([
        {
          weekday: 'MON',
          startPeriod: 2,
          duration: 2,
          subjectCode: 'MATH',
          teacherCode: 'ROHA',
          room: 'R1',
          weekMode: 'ALL',
        },
        {
          weekday: 'MON',
          startPeriod: 3,
          duration: 1,
          subjectCode: 'ENGL',
          teacherCode: 'ABCD',
          room: 'R2',
          weekMode: 'ALL',
        },
      ])
    ).toThrow('Konflikt');
  });

  it('allows overlaps when allowOverlaps=true', () => {
    const result = validateTimetableEntries(
      [
        {
          weekday: 'MON',
          startPeriod: 2,
          duration: 2,
          subjectCode: 'MATH',
          teacherCode: 'ROHA',
          room: 'R1',
          weekMode: 'ALL',
        },
        {
          weekday: 'MON',
          startPeriod: 3,
          duration: 1,
          subjectCode: 'ENGL',
          teacherCode: 'ABCD',
          room: 'R2',
          weekMode: 'ALL',
        },
      ],
      { allowOverlaps: true }
    );

    expect(result).toHaveLength(2);
  });

  it('reports overlap conflicts with weekday and periods', () => {
    const conflicts = findTimetableConflicts([
      {
        id: 'left',
        weekday: 'MON',
        startPeriod: 2,
        duration: 3,
        subjectCode: 'MATH',
        teacherCode: 'ROHA',
        room: 'R1',
        weekMode: 'ALL',
      },
      {
        id: 'right',
        weekday: 'MON',
        startPeriod: 4,
        duration: 1,
        subjectCode: 'ENGL',
        teacherCode: 'ABCD',
        room: 'R2',
        weekMode: 'ALL',
      },
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({
      weekday: 'MON',
      periods: [4],
      left: { id: 'left' },
      right: { id: 'right' },
    });
  });
});
