export const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

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
