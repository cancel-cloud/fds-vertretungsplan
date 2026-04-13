import { startOfLocalDay } from '@/lib/date-utils';

const DEMO_MODE_VALUE = 'demo';

export const DEMO_ANCHOR_DATE_NUMBER = 20260216;
export const DEMO_RANGE_START_NUMBER = 20260209;
export const DEMO_RANGE_END_NUMBER = 20260223;

const dateFromNumber = (value: number): Date => {
  const raw = String(value);
  const year = Number.parseInt(raw.slice(0, 4), 10);
  const month = Number.parseInt(raw.slice(4, 6), 10) - 1;
  const day = Number.parseInt(raw.slice(6, 8), 10);
  return new Date(year, month, day);
};

export const DEMO_ANCHOR_DATE = dateFromNumber(DEMO_ANCHOR_DATE_NUMBER);
export const DEMO_RANGE_START_DATE = dateFromNumber(DEMO_RANGE_START_NUMBER);
export const DEMO_RANGE_END_DATE = dateFromNumber(DEMO_RANGE_END_NUMBER);
export const DEMO_DATE_RANGE_LABEL = `${DEMO_RANGE_START_NUMBER}..${DEMO_RANGE_END_NUMBER}`;

export const toDateNumber = (date: Date): number => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return Number.parseInt(`${year}${month}${day}`, 10);
};

export const isDemoMode = (): boolean => process.env.APP_MODE?.trim().toLowerCase() === DEMO_MODE_VALUE;

const resolveEnv = (name: keyof NodeJS.ProcessEnv): string | undefined => {
  const raw = process.env[name];
  if (!raw) {
    return undefined;
  }

  const value = raw.trim();
  return value.length > 0 ? value : undefined;
};

export const resolveDemoAwareEnv = (
  baseName: keyof NodeJS.ProcessEnv,
  demoName: keyof NodeJS.ProcessEnv
): string | undefined => {
  if (isDemoMode()) {
    const demoValue = resolveEnv(demoName);
    if (demoValue) {
      return demoValue;
    }
  }

  return resolveEnv(baseName);
};

export const isDemoDateAllowed = (value: Date | number): boolean => {
  const numeric = typeof value === 'number' ? value : toDateNumber(value);
  return numeric >= DEMO_RANGE_START_NUMBER && numeric <= DEMO_RANGE_END_NUMBER;
};

export const clampToDemoDate = (date: Date): Date => {
  const normalized = startOfLocalDay(date);
  const numeric = toDateNumber(normalized);

  if (numeric < DEMO_RANGE_START_NUMBER) {
    return new Date(DEMO_RANGE_START_DATE);
  }

  if (numeric > DEMO_RANGE_END_NUMBER) {
    return new Date(DEMO_RANGE_END_DATE);
  }

  return normalized;
};
