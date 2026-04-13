import { describe, expect, it } from 'vitest';
import { resolveCommandSearchIntent } from '@/lib/command-menu/search-intent';

describe('resolveCommandSearchIntent', () => {
  const monday = new Date('2026-02-16T12:00:00.000Z');

  it('routes authenticated today-query to dashboard with school-day date and stripped search', () => {
    const result = resolveCommandSearchIntent({
      query: 'today math',
      isAuthenticated: true,
      now: monday,
    });

    expect(result.href).toBe('/stundenplan/dashboard?scope=all&date=20260216&search=math');
    expect(result.searchQuery).toBe('math');
    expect(result.dayIntent).toBe('today');
  });

  it('routes authenticated tomorrow-query to dashboard and omits empty search', () => {
    const result = resolveCommandSearchIntent({
      query: 'tomorrow',
      isAuthenticated: true,
      now: monday,
    });

    expect(result.href).toBe('/stundenplan/dashboard?scope=all&date=20260217');
    expect(result.searchQuery).toBe('');
    expect(result.dayIntent).toBe('tomorrow');
  });

  it('routes day-after-tomorrow query and keeps remaining search terms', () => {
    const result = resolveCommandSearchIntent({
      query: 'day after tomorrow teacherX',
      isAuthenticated: true,
      now: monday,
    });

    expect(result.href).toBe('/stundenplan/dashboard?scope=all&date=20260218&search=teacherX');
    expect(result.searchQuery).toBe('teacherX');
    expect(result.dayIntent).toBe('day_after_tomorrow');
  });

  it('defaults authenticated teacher-only query to school-today date', () => {
    const result = resolveCommandSearchIntent({
      query: 'Mr. Smith',
      isAuthenticated: true,
      now: monday,
    });

    expect(result.href).toBe('/stundenplan/dashboard?scope=all&date=20260216&search=Mr.+Smith');
    expect(result.searchQuery).toBe('Mr. Smith');
    expect(result.dayIntent).toBe(null);
  });

  it('routes guest query to home and keeps original query text', () => {
    const result = resolveCommandSearchIntent({
      query: 'today math',
      isAuthenticated: false,
      now: monday,
    });

    expect(result.href).toBe('/?search=today+math');
    expect(result.searchQuery).toBe('today math');
    expect(result.dayIntent).toBe(null);
  });

  it('normalizes weekend today query to Monday school day', () => {
    const saturday = new Date('2026-02-14T12:00:00.000Z');
    const result = resolveCommandSearchIntent({
      query: 'today physik',
      isAuthenticated: true,
      now: saturday,
    });

    expect(result.href).toBe('/stundenplan/dashboard?scope=all&date=20260216&search=physik');
    expect(result.searchQuery).toBe('physik');
    expect(result.dayIntent).toBe('today');
  });
});
