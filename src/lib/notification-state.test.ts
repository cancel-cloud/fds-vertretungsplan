import { describe, expect, it } from 'vitest';
import { ProcessedSubstitution } from '@/types';
import {
  buildNotificationFingerprint,
  canonicalizeMatchKeys,
  getNotificationSchoolDays,
  getNextSchoolDays,
  resolveNotificationDeltaAction,
} from '@/lib/notification-state';
import { MatchResult } from '@/lib/schedule-matching';

const makeSubstitution = (overrides: Partial<ProcessedSubstitution>): ProcessedSubstitution => ({
  hours: '5-6',
  time: '',
  group: '11A',
  subject: 'MATH',
  room: '212',
  teacher: 'TUMM',
  type: 'Vertretung',
  info: '',
  originalData: {
    data: ['', '', '', '', '', '', '', ''],
    group: '11A',
  },
  ...overrides,
});

const makeMatch = (substitution: ProcessedSubstitution): MatchResult => ({
  entry: {
    weekday: 'WED',
    startPeriod: 5,
    duration: 2,
    subjectCode: 'MATH',
    teacherCode: 'TUMM',
    room: '212',
    weekMode: 'ALL',
  },
  substitution,
  subjectMatch: true,
  teacherMatch: true,
  roomMatch: true,
  confidence: 'high',
});

describe('getNextSchoolDays', () => {
  it('skips weekend when lookahead is 1', () => {
    const friday = new Date(2026, 1, 13);
    const [next] = getNextSchoolDays(friday, 1);

    expect(next.getDay()).toBe(1);
    expect(next.getDate()).toBe(16);
    expect(next.getMonth()).toBe(1);
    expect(next.getFullYear()).toBe(2026);
  });

  it('returns Fri, Mon, Tue for Thursday + 3 school days', () => {
    const thursday = new Date(2026, 1, 12);
    const result = getNextSchoolDays(thursday, 3);

    expect(result).toHaveLength(3);
    expect(result.map((date) => date.getDay())).toEqual([5, 1, 2]);
    expect(result.map((date) => date.getDate())).toEqual([13, 16, 17]);
  });

  it('can include today when requested', () => {
    const monday = new Date(2026, 1, 16);
    const result = getNotificationSchoolDays(monday, 2, { includeToday: true });

    expect(result).toHaveLength(2);
    expect(result.map((date) => date.getDay())).toEqual([1, 2]);
    expect(result.map((date) => date.getDate())).toEqual([16, 17]);
  });
});

describe('fingerprint canonicalization', () => {
  it('produces the same keys and fingerprint for different input order', () => {
    const matchA = makeMatch(makeSubstitution({ hours: '3', subject: 'DEUT', teacher: 'SIMC', type: 'Entfall' }));
    const matchB = makeMatch(makeSubstitution({ hours: '5-6', subject: 'MATH', teacher: 'TUMM', type: 'Vertretung' }));

    const keysA = canonicalizeMatchKeys([matchA, matchB]);
    const keysB = canonicalizeMatchKeys([matchB, matchA]);
    expect(keysA).toEqual(keysB);

    const fingerprintA = buildNotificationFingerprint('user-1', 20260212, keysA);
    const fingerprintB = buildNotificationFingerprint('user-1', 20260212, keysB);
    expect(fingerprintA).toBe(fingerprintB);
  });
});

describe('resolveNotificationDeltaAction', () => {
  it('sends only on first seen or changed fingerprints', () => {
    expect(resolveNotificationDeltaAction(null, 'fp-a', 1)).toBe('send');
    expect(resolveNotificationDeltaAction('fp-a', 'fp-a', 1)).toBe('skip');
    expect(resolveNotificationDeltaAction('fp-a', 'fp-b', 1)).toBe('send');
    expect(resolveNotificationDeltaAction('fp-b', 'fp-a', 1)).toBe('send');
  });

  it('clears state when no matches remain', () => {
    expect(resolveNotificationDeltaAction('fp-a', null, 0)).toBe('clear');
    expect(resolveNotificationDeltaAction(null, null, 0)).toBe('skip');
  });
});
