import { ProcessedSubstitution } from '@/types';
import { LessonDuration, WeekMode, Weekday } from '@/types/user-system';
import { appliesToWeekMode, periodsForEntry, weekdayFromDate } from '@/lib/timetable';

export interface TimetableMatchEntry {
  id?: string;
  weekday: Weekday;
  startPeriod: number;
  duration: LessonDuration;
  subjectCode: string;
  teacherCode: string;
  room: string | null;
  weekMode: WeekMode;
}

export interface MatchResult {
  entry: TimetableMatchEntry;
  substitution: ProcessedSubstitution;
  subjectMatch: boolean;
  teacherMatch: boolean;
  roomMatch: boolean;
  confidence: 'high' | 'medium';
}

const normalizeToken = (value: string): string => value.trim().toUpperCase();

export const parsePeriodsFromHours = (hours: string): number[] => {
  const numericTokens = hours
    .match(/\d+/g)
    ?.map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 16);

  if (!numericTokens || numericTokens.length === 0) {
    return [];
  }

  if (numericTokens.length === 1) {
    return [numericTokens[0]];
  }

  const start = Math.min(numericTokens[0], numericTokens[1]);
  const end = Math.max(numericTokens[0], numericTokens[1]);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index).filter(
    (value) => value >= 1 && value <= 16
  );
};

const textMatchesCode = (source: string, code: string): boolean => {
  const normalizedSource = normalizeToken(source);
  const normalizedCode = normalizeToken(code);

  if (!normalizedSource || !normalizedCode) {
    return false;
  }

  if (normalizedSource === normalizedCode) {
    return true;
  }

  return normalizedSource.includes(normalizedCode) || normalizedCode.includes(normalizedSource);
};

export const matchSubstitutionToEntry = (
  substitution: ProcessedSubstitution,
  entry: TimetableMatchEntry,
  targetDate: Date
): MatchResult | null => {
  const weekday = weekdayFromDate(targetDate);
  if (!weekday || weekday !== entry.weekday) {
    return null;
  }

  if (!appliesToWeekMode(entry.weekMode, targetDate)) {
    return null;
  }

  const substitutionPeriods = parsePeriodsFromHours(substitution.hours);
  const entryPeriods = periodsForEntry(entry.startPeriod, entry.duration);
  const overlaps = substitutionPeriods.some((period) => entryPeriods.includes(period));

  if (!overlaps) {
    return null;
  }

  const subjectMatch = textMatchesCode(substitution.subject, entry.subjectCode);
  const teacherMatch = textMatchesCode(substitution.teacher, entry.teacherCode);

  if (!subjectMatch && !teacherMatch) {
    return null;
  }

  const roomMatch = Boolean(entry.room && textMatchesCode(substitution.room, entry.room));

  return {
    entry,
    substitution,
    subjectMatch,
    teacherMatch,
    roomMatch,
    confidence: roomMatch || (subjectMatch && teacherMatch) ? 'high' : 'medium',
  };
};

export const findRelevantSubstitutions = (
  substitutions: ProcessedSubstitution[],
  entries: TimetableMatchEntry[],
  targetDate: Date
): MatchResult[] => {
  const matches: MatchResult[] = [];

  for (const substitution of substitutions) {
    for (const entry of entries) {
      const match = matchSubstitutionToEntry(substitution, entry, targetDate);
      if (match) {
        matches.push(match);
      }
    }
  }

  return matches;
};
