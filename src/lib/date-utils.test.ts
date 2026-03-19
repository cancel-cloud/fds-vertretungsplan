import { describe, expect, it } from 'vitest';
import { normalizeToSchoolDay, parseDateParam } from '@/lib/date-utils';

describe('date-utils school day helpers', () => {
  it('normalizes Saturday forward to Monday by default', () => {
    const saturday = new Date(2026, 1, 14);

    expect(normalizeToSchoolDay(saturday).toISOString()).toBe(new Date(2026, 1, 16).toISOString());
  });

  it('normalizes Sunday backward when requested', () => {
    const sunday = new Date(2026, 1, 15);

    expect(normalizeToSchoolDay(sunday, -1).toISOString()).toBe(new Date(2026, 1, 13).toISOString());
  });

  it('parses YYYYMMDD date params into local dates', () => {
    const parsed = parseDateParam('20260218');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(1);
    expect(parsed?.getDate()).toBe(18);
  });

  it('returns null for invalid date params', () => {
    expect(parseDateParam('2026-02-18')).toBeNull();
    expect(parseDateParam(null)).toBeNull();
    expect(parseDateParam('20260231')).toBeNull();
    expect(parseDateParam('20261301')).toBeNull();
    expect(parseDateParam('20260010')).toBeNull();
  });
});
