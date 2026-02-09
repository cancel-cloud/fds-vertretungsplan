const STORAGE_KEY = 'fds-device-id';

const createDeviceId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `fds-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getDeviceId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const generated = createDeviceId();
    localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  } catch {
    return null;
  }
};

export const sanitizeDeviceId = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const safe = trimmed.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 96);
  return safe.length > 0 ? safe : null;
};
