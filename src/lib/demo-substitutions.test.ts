import { describe, expect, it } from 'vitest';
import { generateDemoDatasetForUser } from '@/lib/demo-substitutions';

describe('generateDemoDatasetForUser', () => {
  it('generates demo data even when no direct timetable match exists in +1..+3 days', () => {
    const result = generateDemoDatasetForUser('user-1', 'user@example.com', [
      {
        weekday: 'MON',
        startPeriod: 1,
        duration: 1,
        subjectCode: 'MAT',
        teacherCode: 'ABC',
        room: 'R101',
        weekMode: 'ALL',
      },
    ]);

    expect(result.dataset.days['20260216']).toBeDefined();
    expect(result.dataset.days[String(result.selectedDates.future)]).toBeDefined();
    expect(result.dataset.days[String(result.selectedDates.past)]).toBeDefined();
  });
});
