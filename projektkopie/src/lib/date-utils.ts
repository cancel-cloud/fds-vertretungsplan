export const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isSchoolDay = (date: Date): boolean => !isWeekend(date);

export const adjustWeekendToMonday = (date: Date): Date => {
  const normalizedDate = startOfLocalDay(date);
  const day = normalizedDate.getDay();

  if (day === 6) {
    normalizedDate.setDate(normalizedDate.getDate() + 2);
  } else if (day === 0) {
    normalizedDate.setDate(normalizedDate.getDate() + 1);
  }

  return normalizedDate;
};

export const normalizeToSchoolDay = (date: Date, direction: 1 | -1 = 1): Date => {
  const normalized = startOfLocalDay(date);
  if (isSchoolDay(normalized)) {
    return normalized;
  }

  while (!isSchoolDay(normalized)) {
    normalized.setDate(normalized.getDate() + direction);
  }

  return normalized;
};

export const addSchoolDays = (date: Date, offset: number): Date => {
  const result = startOfLocalDay(date);
  const direction = offset >= 0 ? 1 : -1;
  let remaining = Math.abs(offset);

  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    if (!isWeekend(result)) {
      remaining -= 1;
    }
  }

  return result;
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatQuickDate = (date: Date): string =>
  date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export const formatChipDate = (date: Date): string =>
  date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

export const formatLongDate = (date: Date): string =>
  date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const parseDateParam = (value: string | null): Date | null => {
  if (!value || !/^\d{8}$/.test(value)) {
    return null;
  }

  const year = Number.parseInt(value.slice(0, 4), 10);
  const month = Number.parseInt(value.slice(4, 6), 10) - 1;
  const day = Number.parseInt(value.slice(6, 8), 10);
  const date = new Date(year, month, day);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
};
