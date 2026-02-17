import { formatDateForApi } from '@/lib/utils';

export type CommandSearchDayIntent = 'today' | 'tomorrow' | 'day_after_tomorrow' | null;

export interface ResolveCommandSearchIntentOptions {
  query: string;
  isAuthenticated: boolean;
  now?: Date;
}

export interface ResolveCommandSearchIntentResult {
  href: string;
  searchQuery: string;
  dayIntent: CommandSearchDayIntent;
}

const DAY_AFTER_TOMORROW_PATTERN = /(?<!\p{L})day\s+after\s+tomorrow(?!\p{L})|(?<!\p{L})(?:übermorgen|uebermorgen)(?!\p{L})/iu;
const TOMORROW_PATTERN = /(?<!\p{L})(?:tomorrow|morgen)(?!\p{L})/iu;
const TODAY_PATTERN = /(?<!\p{L})(?:today|heute)(?!\p{L})/iu;
const REMOVABLE_DAY_KEYWORDS_PATTERN =
  /(?<!\p{L})day\s+after\s+tomorrow(?!\p{L})|(?<!\p{L})(?:übermorgen|uebermorgen|tomorrow|morgen|today|heute)(?!\p{L})/giu;

const normalizeToSchoolDay = (date: Date): Date => {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = normalized.getDay();

  if (day === 0) {
    normalized.setDate(normalized.getDate() + 1);
    return normalized;
  }

  if (day === 6) {
    normalized.setDate(normalized.getDate() + 2);
    return normalized;
  }

  return normalized;
};

const addSchoolDays = (date: Date, offset: number): Date => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let remaining = Math.abs(offset);
  const direction = offset >= 0 ? 1 : -1;

  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    const day = result.getDay();
    if (day >= 1 && day <= 5) {
      remaining -= 1;
    }
  }

  return result;
};

const detectDayIntent = (query: string): CommandSearchDayIntent => {
  if (DAY_AFTER_TOMORROW_PATTERN.test(query)) {
    return 'day_after_tomorrow';
  }

  if (TOMORROW_PATTERN.test(query)) {
    return 'tomorrow';
  }

  if (TODAY_PATTERN.test(query)) {
    return 'today';
  }

  return null;
};

const stripDayKeywords = (query: string): string =>
  query
    .replace(REMOVABLE_DAY_KEYWORDS_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const resolveCommandSearchIntent = ({
  query,
  isAuthenticated,
  now = new Date(),
}: ResolveCommandSearchIntentOptions): ResolveCommandSearchIntentResult => {
  const trimmed = query.trim();

  if (!isAuthenticated) {
    const params = new URLSearchParams();
    if (trimmed.length > 0) {
      params.set('search', trimmed);
    }

    return {
      href: params.size > 0 ? `/?${params.toString()}` : '/',
      searchQuery: trimmed,
      dayIntent: null,
    };
  }

  const dayIntent = detectDayIntent(trimmed);
  const searchQuery = stripDayKeywords(trimmed);
  const today = normalizeToSchoolDay(now);
  const targetDate =
    dayIntent === 'day_after_tomorrow'
      ? addSchoolDays(today, 2)
      : dayIntent === 'tomorrow'
        ? addSchoolDays(today, 1)
        : today;

  const params = new URLSearchParams();
  params.set('scope', 'all');
  params.set('date', formatDateForApi(targetDate));
  if (searchQuery.length > 0) {
    params.set('search', searchQuery);
  }

  return {
    href: `/stundenplan/dashboard?${params.toString()}`,
    searchQuery,
    dayIntent,
  };
};
