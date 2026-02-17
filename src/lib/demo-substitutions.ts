import { ProcessedSubstitution, SubstitutionType, WebUntisSubstitutionRow } from '@/types';
import { processApiResponse } from '@/lib/data-processing';
import { TimetableMatchEntry, findRelevantSubstitutions } from '@/lib/schedule-matching';
import { LessonDuration, WeekMode, Weekday } from '@/types/user-system';
import { appliesToWeekMode } from '@/lib/timetable';
import {
  DEMO_ANCHOR_DATE,
  DEMO_ANCHOR_DATE_NUMBER,
  DEMO_RANGE_END_DATE,
  DEMO_RANGE_END_NUMBER,
  DEMO_RANGE_START_DATE,
  DEMO_RANGE_START_NUMBER,
  DEMO_DATE_RANGE_LABEL,
  toDateNumber,
} from '@/lib/demo-config';

const DEMO_DATASET_VERSION = 1;
const SCHOOL_DAY_INDEXES = new Set([1, 2, 3, 4, 5]);

const PERIOD_TIMES: Record<number, string> = {
  1: '07:45-08:30',
  2: '08:30-09:15',
  3: '09:30-10:15',
  4: '10:15-11:00',
  5: '11:15-12:00',
  6: '12:00-12:45',
  7: '13:15-14:00',
  8: '14:00-14:45',
  9: '14:55-15:40',
  10: '15:40-16:25',
  11: '16:35-17:20',
  12: '17:20-18:05',
  13: '18:15-19:00',
  14: '19:00-19:45',
  15: '19:55-20:40',
  16: '20:40-21:25',
};

const SHOWCASE_TYPES: SubstitutionType[] = [
  'Entfall',
  'Raumänderung',
  'Vertretung',
  'Verlegung',
  'Sondereinsatz',
  'EVA',
  'Klausur',
  'Freisetzung',
  'Sonstiges',
];

interface TimetableEntryLike {
  weekday: Weekday;
  startPeriod: number;
  duration: number;
  subjectCode: string;
  teacherCode: string;
  room: string | null;
  weekMode: WeekMode;
}

interface DemoDatasetDays {
  [dateNumber: string]: WebUntisSubstitutionRow[];
}

export interface StoredDemoDataset {
  version: number;
  anchorDate: number;
  startDate: number;
  endDate: number;
  generatedForUserId: string;
  generatedForEmail: string;
  generatedAt: string;
  days: DemoDatasetDays;
}

export interface DemoDatasetGenerationResult {
  dataset: StoredDemoDataset;
  guarantees: {
    todayMatches: number;
    pastMatches: number;
    futureMatches: number;
  };
  selectedDates: {
    today: number;
    past: number;
    future: number;
  };
}

export class DemoDatasetGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoDatasetGenerationError';
  }
}

const normalizeToken = (value: string): string => value.trim().toUpperCase();

const toWeekday = (date: Date): Weekday | null => {
  const day = date.getDay();
  if (day === 1) return 'MON';
  if (day === 2) return 'TUE';
  if (day === 3) return 'WED';
  if (day === 4) return 'THU';
  if (day === 5) return 'FRI';
  return null;
};

const toHoursString = (entry: TimetableMatchEntry): string => {
  const endPeriod = entry.startPeriod + entry.duration - 1;
  if (endPeriod === entry.startPeriod) {
    return String(entry.startPeriod);
  }
  return `${entry.startPeriod} - ${endPeriod}`;
};

const toTimeString = (entry: TimetableMatchEntry): string => {
  const endPeriod = entry.startPeriod + entry.duration - 1;
  const start = PERIOD_TIMES[entry.startPeriod] ?? '';
  const end = PERIOD_TIMES[endPeriod] ?? '';
  if (!start || !end) {
    return '';
  }
  const from = start.split('-')[0];
  const to = end.split('-')[1];
  return `${from}-${to}`;
};

const mapSubstitutionTypeLabel = (type: SubstitutionType): string => {
  if (type === 'Sonstiges') {
    return 'Hinweis';
  }
  return type;
};

const buildRow = (
  hours: string,
  time: string,
  group: string,
  subject: string,
  room: string,
  teacher: string,
  type: SubstitutionType,
  info: string
): WebUntisSubstitutionRow => ({
  data: [hours, time, group, subject, room, teacher, mapSubstitutionTypeLabel(type), info],
  cssClasses: [],
  cellClasses: type === 'Entfall' ? { 6: ['cancelStyle'] } : {},
  group,
});

const buildNoiseRow = (date: Date, index: number, type: SubstitutionType): WebUntisSubstitutionRow => {
  const hour = (index % 8) + 1;
  const hours = index % 3 === 0 ? `${hour} - ${Math.min(hour + 1, 16)}` : String(hour);
  const group = `DEMO-GR-${date.getDate().toString().padStart(2, '0')}-${index}`;
  return buildRow(
    hours,
    PERIOD_TIMES[hour] ?? '',
    group,
    `DM-SUB-${index}`,
    `R${(index % 10) + 1}`,
    `DMT${(index % 10) + 1}`,
    type,
    'Demo Datensatz'
  );
};

const buildMatchRow = (
  entry: TimetableMatchEntry,
  type: SubstitutionType,
  info: string,
  roomSuffix: string
): WebUntisSubstitutionRow =>
  buildRow(
    toHoursString(entry),
    toTimeString(entry),
    `DEMO ${entry.weekday}`,
    entry.subjectCode,
    entry.room ? `${entry.room} (${roomSuffix})` : roomSuffix,
    entry.teacherCode,
    type,
    info
  );

const isSchoolDay = (date: Date): boolean => SCHOOL_DAY_INDEXES.has(date.getDay());

const toDateList = (start: Date, end: Date): Date[] => {
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const result: Date[] = [];

  while (cursor <= end) {
    result.push(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

const toMatchEntries = (entries: TimetableEntryLike[]): TimetableMatchEntry[] =>
  entries
    .filter(
      (entry) =>
        entry.duration >= 1 &&
        entry.duration <= 4 &&
        entry.startPeriod >= 1 &&
        entry.startPeriod <= 16 &&
        entry.startPeriod + entry.duration - 1 <= 16
    )
    .map((entry) => ({
      weekday: entry.weekday,
      startPeriod: entry.startPeriod,
      duration: entry.duration as LessonDuration,
      subjectCode: normalizeToken(entry.subjectCode),
      teacherCode: normalizeToken(entry.teacherCode),
      room: entry.room ? entry.room.trim() : null,
      weekMode: entry.weekMode,
    }));

const pickEntryForDate = (entries: TimetableMatchEntry[], date: Date): TimetableMatchEntry | null => {
  const weekday = toWeekday(date);
  if (!weekday) {
    return null;
  }

  return entries.find((entry) => entry.weekday === weekday && appliesToWeekMode(entry.weekMode, date)) ?? null;
};

const addDateOffset = (date: Date, offset: number): Date => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + offset);
  return next;
};

const countMatchesForDate = (
  rows: WebUntisSubstitutionRow[],
  entries: TimetableMatchEntry[],
  date: Date
): number => {
  const substitutions: ProcessedSubstitution[] = processApiResponse(rows);
  return findRelevantSubstitutions(substitutions, entries, date).length;
};

const findPastDateWithEntry = (entries: TimetableMatchEntry[]): Date | null => {
  for (const date of toDateList(DEMO_RANGE_START_DATE, addDateOffset(DEMO_ANCHOR_DATE, -1)).reverse()) {
    if (!isSchoolDay(date)) {
      continue;
    }

    if (pickEntryForDate(entries, date)) {
      return date;
    }
  }

  return null;
};

const findFutureDateWithEntry = (entries: TimetableMatchEntry[]): Date | null => {
  for (let dayOffset = 1; dayOffset <= 3; dayOffset += 1) {
    const date = addDateOffset(DEMO_ANCHOR_DATE, dayOffset);
    if (!isSchoolDay(date)) {
      continue;
    }

    if (date > DEMO_RANGE_END_DATE) {
      continue;
    }

    if (pickEntryForDate(entries, date)) {
      return date;
    }
  }

  return null;
};

const findLastPastSchoolDate = (): Date | null => {
  for (const date of toDateList(DEMO_RANGE_START_DATE, addDateOffset(DEMO_ANCHOR_DATE, -1)).reverse()) {
    if (isSchoolDay(date)) {
      return date;
    }
  }

  return null;
};

const findNearFutureSchoolDate = (): Date | null => {
  for (let dayOffset = 1; dayOffset <= 3; dayOffset += 1) {
    const date = addDateOffset(DEMO_ANCHOR_DATE, dayOffset);
    if (!isSchoolDay(date)) {
      continue;
    }
    if (date > DEMO_RANGE_END_DATE) {
      continue;
    }
    return date;
  }

  for (const date of toDateList(addDateOffset(DEMO_ANCHOR_DATE, 1), DEMO_RANGE_END_DATE)) {
    if (isSchoolDay(date)) {
      return date;
    }
  }

  return null;
};

const toSyntheticEntryForDate = (source: TimetableMatchEntry, date: Date): TimetableMatchEntry | null => {
  const weekday = toWeekday(date);
  if (!weekday) {
    return null;
  }

  return {
    ...source,
    weekday,
    weekMode: 'ALL',
  };
};

const isRowTuple = (value: unknown): value is [string, string, string, string, string, string, string, string] =>
  Array.isArray(value) && value.length === 8 && value.every((entry) => typeof entry === 'string');

const isWebUntisRow = (value: unknown): value is WebUntisSubstitutionRow => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { data?: unknown; cssClasses?: unknown; cellClasses?: unknown; group?: unknown };
  return (
    isRowTuple(candidate.data) &&
    Array.isArray(candidate.cssClasses) &&
    typeof candidate.group === 'string' &&
    candidate.cellClasses !== null &&
    typeof candidate.cellClasses === 'object'
  );
};

export const parseStoredDemoDataset = (value: unknown): StoredDemoDataset | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as {
    version?: unknown;
    anchorDate?: unknown;
    startDate?: unknown;
    endDate?: unknown;
    generatedForUserId?: unknown;
    generatedForEmail?: unknown;
    generatedAt?: unknown;
    days?: unknown;
  };

  if (
    typeof candidate.version !== 'number' ||
    typeof candidate.anchorDate !== 'number' ||
    typeof candidate.startDate !== 'number' ||
    typeof candidate.endDate !== 'number' ||
    typeof candidate.generatedForUserId !== 'string' ||
    typeof candidate.generatedForEmail !== 'string' ||
    typeof candidate.generatedAt !== 'string' ||
    !candidate.days ||
    typeof candidate.days !== 'object'
  ) {
    return null;
  }

  const parsedDays: DemoDatasetDays = {};
  for (const [dateKey, rawRows] of Object.entries(candidate.days)) {
    if (!/^\d{8}$/.test(dateKey) || !Array.isArray(rawRows)) {
      return null;
    }

    const rows = rawRows.filter((row): row is WebUntisSubstitutionRow => isWebUntisRow(row));
    if (rows.length !== rawRows.length) {
      return null;
    }

    parsedDays[dateKey] = rows;
  }

  return {
    version: candidate.version,
    anchorDate: candidate.anchorDate,
    startDate: candidate.startDate,
    endDate: candidate.endDate,
    generatedForUserId: candidate.generatedForUserId,
    generatedForEmail: candidate.generatedForEmail,
    generatedAt: candidate.generatedAt,
    days: parsedDays,
  };
};

export const getDemoRowsForDate = (dataset: StoredDemoDataset, dateNumber: number): WebUntisSubstitutionRow[] => {
  const rows = dataset.days[String(dateNumber)];
  return Array.isArray(rows) ? rows : [];
};

export const getStoredDemoDataset = async (): Promise<StoredDemoDataset | null> => {
  const { prisma } = await import('@/lib/prisma');
  const settings = await prisma.appSettings.findUnique({
    where: { id: 1 },
    select: { demoDataset: true },
  });

  return parseStoredDemoDataset(settings?.demoDataset);
};

export const buildDemoDatasetMissingMessage = (): string =>
  `Demo-Daten sind noch nicht erzeugt. Öffne /stundenplan/admin und klicke bei einem Benutzer auf "Demo-Daten generieren". (Fenster: ${DEMO_DATE_RANGE_LABEL})`;

export const generateDemoDatasetForUser = (
  userId: string,
  userEmail: string,
  timetableEntries: TimetableEntryLike[]
): DemoDatasetGenerationResult => {
  const matchEntries = toMatchEntries(timetableEntries);
  if (matchEntries.length === 0) {
    throw new DemoDatasetGenerationError('Der Benutzer hat keinen gültigen Stundenplan.');
  }

  const primaryEntry = matchEntries[0];
  const todayEntry =
    pickEntryForDate(matchEntries, DEMO_ANCHOR_DATE) ?? toSyntheticEntryForDate(primaryEntry, DEMO_ANCHOR_DATE);
  if (!todayEntry) {
    throw new DemoDatasetGenerationError('Demo-Daten konnten für den heutigen Tag nicht erzeugt werden.');
  }

  const pastDate = findPastDateWithEntry(matchEntries) ?? findLastPastSchoolDate();
  if (!pastDate) {
    throw new DemoDatasetGenerationError('Kein vergangener Schultag im Demo-Zeitraum gefunden.');
  }

  const futureDate = findFutureDateWithEntry(matchEntries) ?? findNearFutureSchoolDate();
  if (!futureDate) {
    throw new DemoDatasetGenerationError('Kein zukünftiger Schultag im Demo-Zeitraum gefunden.');
  }

  const pastEntry = pickEntryForDate(matchEntries, pastDate) ?? toSyntheticEntryForDate(primaryEntry, pastDate);
  const futureEntry = pickEntryForDate(matchEntries, futureDate) ?? toSyntheticEntryForDate(primaryEntry, futureDate);
  if (!pastEntry || !futureEntry) {
    throw new DemoDatasetGenerationError('Demo-Daten konnten nicht aus dem Stundenplan abgeleitet werden.');
  }

  const days: DemoDatasetDays = {};
  const allDates = toDateList(DEMO_RANGE_START_DATE, DEMO_RANGE_END_DATE);
  for (const [index, date] of allDates.entries()) {
    const key = String(toDateNumber(date));
    const type = SHOWCASE_TYPES[index % SHOWCASE_TYPES.length];
    days[key] = [buildNoiseRow(date, index, type)];
  }

  const todayNumber = toDateNumber(DEMO_ANCHOR_DATE);
  const pastNumber = toDateNumber(pastDate);
  const futureNumber = toDateNumber(futureDate);

  days[String(todayNumber)] = [
    buildMatchRow(todayEntry, 'Vertretung', 'Demo: Relevanter Treffer heute', 'D-HEUTE'),
    ...days[String(todayNumber)],
  ];
  days[String(pastNumber)] = [
    buildMatchRow(pastEntry, 'Entfall', 'Demo: Vergangener relevanter Treffer', 'D-PAST'),
    ...days[String(pastNumber)],
  ];
  days[String(futureNumber)] = [
    buildMatchRow(futureEntry, 'Raumänderung', 'Demo: Kommender relevanter Treffer', 'D-FUTURE'),
    ...days[String(futureNumber)],
  ];

  const todayMatches = countMatchesForDate(days[String(todayNumber)] ?? [], matchEntries, DEMO_ANCHOR_DATE);
  const pastMatches = countMatchesForDate(days[String(pastNumber)] ?? [], matchEntries, pastDate);
  const futureMatches = countMatchesForDate(days[String(futureNumber)] ?? [], matchEntries, futureDate);

  const dataset: StoredDemoDataset = {
    version: DEMO_DATASET_VERSION,
    anchorDate: DEMO_ANCHOR_DATE_NUMBER,
    startDate: DEMO_RANGE_START_NUMBER,
    endDate: DEMO_RANGE_END_NUMBER,
    generatedForUserId: userId,
    generatedForEmail: userEmail,
    generatedAt: new Date().toISOString(),
    days,
  };

  return {
    dataset,
    guarantees: {
      todayMatches,
      pastMatches,
      futureMatches,
    },
    selectedDates: {
      today: todayNumber,
      past: pastNumber,
      future: futureNumber,
    },
  };
};
