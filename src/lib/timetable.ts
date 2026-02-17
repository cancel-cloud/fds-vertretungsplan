import { LessonDuration, WeekMode, Weekday } from '@/types/user-system';

export class TimetableValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimetableValidationError';
  }
}

export interface NormalizedTimetableEntryInput {
  weekday: Weekday;
  startPeriod: number;
  duration: LessonDuration;
  subjectCode: string;
  teacherCode: string;
  room: string | null;
  weekMode: WeekMode;
}

export interface TimetableValidationOptions {
  allowOverlaps?: boolean;
}

export interface TimetableConflictEntry {
  id?: string;
  subjectCode: string;
  teacherCode: string;
  startPeriod: number;
  duration: LessonDuration;
  weekMode: WeekMode;
}

export interface TimetableConflict {
  weekday: Weekday;
  periods: number[];
  left: TimetableConflictEntry;
  right: TimetableConflictEntry;
}

interface NormalizedTimetableEntryWithMeta extends NormalizedTimetableEntryInput {
  id?: string;
}

export const WEEKDAYS: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
export const WEEK_MODES: WeekMode[] = ['ALL', 'EVEN', 'ODD'];

const MIN_PERIOD = 1;
const MAX_PERIOD = 16;
const MAX_DURATION = 4;

export const normalizeCode = (value: string): string => value.trim().toUpperCase();

const isWeekModeOverlap = (left: WeekMode, right: WeekMode): boolean => {
  if (left === 'ALL' || right === 'ALL') {
    return true;
  }

  return left === right;
};

export const periodsForEntry = (startPeriod: number, duration: LessonDuration): number[] =>
  Array.from({ length: duration }, (_, index) => startPeriod + index);

const validateEntry = (entry: unknown, index: number): NormalizedTimetableEntryWithMeta => {
  if (!entry || typeof entry !== 'object') {
    throw new TimetableValidationError(`Eintrag ${index + 1} ist ungültig.`);
  }

  const candidate = entry as Record<string, unknown>;

  const weekday = typeof candidate.weekday === 'string' ? candidate.weekday.toUpperCase() : '';
  if (!WEEKDAYS.includes(weekday as Weekday)) {
    throw new TimetableValidationError(`Eintrag ${index + 1}: Ungültiger Tag.`);
  }

  const startPeriod = Number(candidate.startPeriod);
  if (!Number.isInteger(startPeriod) || startPeriod < MIN_PERIOD || startPeriod > MAX_PERIOD) {
    throw new TimetableValidationError(`Eintrag ${index + 1}: Startstunde muss zwischen 1 und 16 liegen.`);
  }

  const duration = Number(candidate.duration);
  if (!Number.isInteger(duration) || duration < 1 || duration > MAX_DURATION) {
    throw new TimetableValidationError(`Eintrag ${index + 1}: Dauer muss zwischen 1 und 4 liegen.`);
  }

  if (startPeriod + duration - 1 > MAX_PERIOD) {
    throw new TimetableValidationError(`Eintrag ${index + 1}: Eintrag darf nicht über Stunde 16 hinausgehen.`);
  }

  const subjectCode = normalizeCode(String(candidate.subjectCode ?? ''));
  if (!subjectCode) {
    throw new TimetableValidationError(`Eintrag ${index + 1}: Fach-Kürzel fehlt.`);
  }

  const teacherCode = normalizeCode(String(candidate.teacherCode ?? ''));
  if (!teacherCode) {
    throw new TimetableValidationError(`Eintrag ${index + 1}: Lehrer-Kürzel fehlt.`);
  }

  const weekModeRaw = typeof candidate.weekMode === 'string' ? candidate.weekMode.toUpperCase() : 'ALL';
  if (!WEEK_MODES.includes(weekModeRaw as WeekMode)) {
    throw new TimetableValidationError(`Eintrag ${index + 1}: Ungültiger Wochenmodus.`);
  }

  const roomRaw = String(candidate.room ?? '').trim();

  return {
    id: typeof candidate.id === 'string' ? candidate.id : undefined,
    weekday: weekday as Weekday,
    startPeriod,
    duration: duration as LessonDuration,
    subjectCode,
    teacherCode,
    room: roomRaw.length > 0 ? roomRaw : null,
    weekMode: weekModeRaw as WeekMode,
  };
};

const normalizeEntries = (entries: unknown): NormalizedTimetableEntryWithMeta[] => {
  if (!Array.isArray(entries)) {
    throw new TimetableValidationError('Der Stundenplan muss ein Array sein.');
  }

  return entries.map((entry, index) => validateEntry(entry, index));
};

const buildConflictEntries = (
  left: NormalizedTimetableEntryWithMeta,
  right: NormalizedTimetableEntryWithMeta
): TimetableConflictEntry[] => [
  {
    id: left.id,
    subjectCode: left.subjectCode,
    teacherCode: left.teacherCode,
    startPeriod: left.startPeriod,
    duration: left.duration,
    weekMode: left.weekMode,
  },
  {
    id: right.id,
    subjectCode: right.subjectCode,
    teacherCode: right.teacherCode,
    startPeriod: right.startPeriod,
    duration: right.duration,
    weekMode: right.weekMode,
  },
];

const buildConflicts = (normalized: NormalizedTimetableEntryWithMeta[]): TimetableConflict[] => {
  const conflicts: TimetableConflict[] = [];

  for (let i = 0; i < normalized.length; i += 1) {
    const left = normalized[i];
    const leftPeriods = periodsForEntry(left.startPeriod, left.duration);

    for (let j = i + 1; j < normalized.length; j += 1) {
      const right = normalized[j];

      if (left.weekday !== right.weekday) {
        continue;
      }

      if (!isWeekModeOverlap(left.weekMode, right.weekMode)) {
        continue;
      }

      const rightPeriods = periodsForEntry(right.startPeriod, right.duration);
      const overlappingPeriods = leftPeriods.filter((period) => rightPeriods.includes(period));
      if (overlappingPeriods.length > 0) {
        const [leftEntry, rightEntry] = buildConflictEntries(left, right);
        conflicts.push({
          weekday: left.weekday,
          periods: overlappingPeriods,
          left: leftEntry,
          right: rightEntry,
        });
      }
    }
  }

  return conflicts;
};

export const findTimetableConflicts = (entries: unknown): TimetableConflict[] => buildConflicts(normalizeEntries(entries));

export const validateTimetableEntries = (
  entries: unknown,
  options: TimetableValidationOptions = {}
): NormalizedTimetableEntryInput[] => {
  const normalized = normalizeEntries(entries);
  const conflicts = buildConflicts(normalized);

  if (!options.allowOverlaps && conflicts.length > 0) {
    const first = conflicts[0];
    throw new TimetableValidationError(`Konflikt am ${first.weekday}: Stunde ${first.periods[0]} ist mehrfach belegt.`);
  }

  return normalized.map((entry) => ({
    weekday: entry.weekday,
    startPeriod: entry.startPeriod,
    duration: entry.duration,
    subjectCode: entry.subjectCode,
    teacherCode: entry.teacherCode,
    room: entry.room,
    weekMode: entry.weekMode,
  }));
};

export const weekdayFromDate = (date: Date): Weekday | null => {
  const day = date.getDay();
  switch (day) {
    case 1:
      return 'MON';
    case 2:
      return 'TUE';
    case 3:
      return 'WED';
    case 4:
      return 'THU';
    case 5:
      return 'FRI';
    default:
      return null;
  }
};

export const isIsoWeekEven = (date: Date): boolean => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo % 2 === 0;
};

export const appliesToWeekMode = (weekMode: WeekMode, date: Date): boolean => {
  if (weekMode === 'ALL') {
    return true;
  }

  const isEven = isIsoWeekEven(date);
  return weekMode === 'EVEN' ? isEven : !isEven;
};
