import { describe, expect, it } from 'vitest';
import { formatDateForApi } from '@/lib/utils';

describe('formatDateForApi', () => {
  it('formats valid dates to YYYYMMDD', () => {
    const date = new Date(2025, 0, 3);
    expect(formatDateForApi(date)).toBe('20250103');
  });

  it('throws for invalid dates', () => {
    const invalidDate = new Date('invalid-date');
    expect(() => formatDateForApi(invalidDate)).toThrow('Invalid Date');
  });
});
