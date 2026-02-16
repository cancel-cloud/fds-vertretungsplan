export const APPLE_PUSH_PROMO_DISMISS_KEY = 'fds.applePushPromo.dismissedUntil';
export const APPLE_PUSH_PROMO_DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const parseDismissUntil = (rawValue: string | null): number | null => {
  if (!rawValue) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

export const getApplePushPromoDismissedUntil = (): number | null => {
  try {
    return parseDismissUntil(window.localStorage.getItem(APPLE_PUSH_PROMO_DISMISS_KEY));
  } catch {
    return null;
  }
};

export const isApplePushPromoDismissed = (now = Date.now()): boolean => {
  const dismissedUntil = getApplePushPromoDismissedUntil();
  return dismissedUntil !== null && dismissedUntil > now;
};

export const dismissApplePushPromo = (now = Date.now(), ttlMs = APPLE_PUSH_PROMO_DISMISS_TTL_MS): number => {
  const dismissedUntil = now + Math.max(0, ttlMs);
  try {
    window.localStorage.setItem(APPLE_PUSH_PROMO_DISMISS_KEY, String(dismissedUntil));
  } catch {
    // Ignore storage write failures.
  }
  return dismissedUntil;
};

export const clearApplePushPromoDismissal = (): void => {
  try {
    window.localStorage.removeItem(APPLE_PUSH_PROMO_DISMISS_KEY);
  } catch {
    // Ignore storage removal failures.
  }
};
