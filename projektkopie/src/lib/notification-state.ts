import crypto from 'node:crypto';
import { MatchResult } from '@/lib/schedule-matching';

export const MIN_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS = 1;
export const MAX_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS = 5;

const normalizeToken = (value: string): string => value.trim().toUpperCase();

export function clampNotificationLookaheadSchoolDays(value: number): number {
  if (!Number.isInteger(value)) {
    return MIN_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS;
  }

  return Math.min(MAX_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS, Math.max(MIN_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS, value));
}

export function getNextSchoolDays(startDate: Date, count: number): Date[] {
  return getNotificationSchoolDays(startDate, count, { includeToday: false });
}

export function getNotificationSchoolDays(
  startDate: Date,
  count: number,
  options?: {
    includeToday?: boolean;
  }
): Date[] {
  const targetCount = clampNotificationLookaheadSchoolDays(count);
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const result: Date[] = [];

  if (options?.includeToday) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      result.push(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    }
  }

  while (result.length < targetCount) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day === 0 || day === 6) {
      continue;
    }

    result.push(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
  }

  return result;
}

export function canonicalizeMatchKeys(matches: MatchResult[]): string[] {
  const uniqueKeys = new Set(
    matches.map((match) => {
      const substitution = match.substitution;
      return [
        normalizeToken(substitution.group),
        normalizeToken(substitution.hours),
        normalizeToken(substitution.subject),
        normalizeToken(substitution.teacher),
        normalizeToken(substitution.type),
        normalizeToken(substitution.room),
      ].join('|');
    })
  );

  return [...uniqueKeys].sort();
}

export function buildNotificationFingerprint(userId: string, targetDate: number, keys: string[]): string {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${targetDate}:${keys.join('||')}`)
    .digest('hex');
}

type DeltaAction = 'send' | 'skip' | 'clear';

export function resolveNotificationDeltaAction(
  previousFingerprint: string | null,
  currentFingerprint: string | null,
  currentMatchCount: number
): DeltaAction {
  if (currentMatchCount <= 0 || !currentFingerprint) {
    return previousFingerprint ? 'clear' : 'skip';
  }

  if (!previousFingerprint) {
    return 'send';
  }

  return previousFingerprint === currentFingerprint ? 'skip' : 'send';
}
