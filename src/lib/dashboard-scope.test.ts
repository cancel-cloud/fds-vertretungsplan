import { describe, expect, it } from 'vitest';
import { parseDashboardScope, resolveDashboardScope } from '@/lib/dashboard-scope';

describe('dashboard-scope', () => {
  it('defaults unknown values to personal', () => {
    expect(parseDashboardScope(undefined)).toBe('personal');
    expect(parseDashboardScope('personal')).toBe('personal');
    expect(parseDashboardScope('unexpected')).toBe('personal');
  });

  it('keeps an explicit all scope', () => {
    expect(parseDashboardScope('all')).toBe('all');
  });

  it('falls back to the caller-provided scope when the query param is missing', () => {
    expect(resolveDashboardScope(undefined, 'all')).toBe('all');
    expect(resolveDashboardScope(null, 'all')).toBe('all');
    expect(resolveDashboardScope(undefined, 'personal')).toBe('personal');
  });
});
