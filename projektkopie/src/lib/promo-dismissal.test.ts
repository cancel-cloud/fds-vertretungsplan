import { beforeEach, describe, expect, it } from 'vitest';
import {
  APPLE_PUSH_PROMO_DISMISS_KEY,
  APPLE_PUSH_PROMO_DISMISS_TTL_MS,
  clearApplePushPromoDismissal,
  dismissApplePushPromo,
  getApplePushPromoDismissedUntil,
  isApplePushPromoDismissed,
} from '@/lib/promo-dismissal';

describe('promo-dismissal', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores dismissal timestamp with default ttl', () => {
    const now = Date.UTC(2026, 1, 16, 10, 0, 0);
    const dismissedUntil = dismissApplePushPromo(now);

    expect(dismissedUntil).toBe(now + APPLE_PUSH_PROMO_DISMISS_TTL_MS);
    expect(window.localStorage.getItem(APPLE_PUSH_PROMO_DISMISS_KEY)).toBe(String(dismissedUntil));
    expect(getApplePushPromoDismissedUntil()).toBe(dismissedUntil);
  });

  it('reports dismissed only before expiry', () => {
    const now = Date.UTC(2026, 1, 16, 10, 0, 0);
    const dismissedUntil = dismissApplePushPromo(now, 1000);

    expect(isApplePushPromoDismissed(now + 900)).toBe(true);
    expect(isApplePushPromoDismissed(dismissedUntil + 1)).toBe(false);
  });

  it('clears dismissal state', () => {
    dismissApplePushPromo(Date.UTC(2026, 1, 16, 10, 0, 0), 1000);
    clearApplePushPromoDismissal();

    expect(window.localStorage.getItem(APPLE_PUSH_PROMO_DISMISS_KEY)).toBeNull();
    expect(isApplePushPromoDismissed()).toBe(false);
  });

  it('ignores malformed stored values', () => {
    window.localStorage.setItem(APPLE_PUSH_PROMO_DISMISS_KEY, 'not-a-number');

    expect(getApplePushPromoDismissedUntil()).toBeNull();
    expect(isApplePushPromoDismissed()).toBe(false);
  });
});
