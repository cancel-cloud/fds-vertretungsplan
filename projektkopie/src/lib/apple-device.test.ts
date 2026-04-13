import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getBrowserDisplayName,
  getPushPromoPlatformState,
  isAppleMobileDevice,
  isEligibleForApplePushPromo,
  isLikelyMobileDevice,
  isStandaloneDisplayMode,
  resolvePushPromoPlatformState,
} from '@/lib/apple-device';

const setNavigatorProperty = (key: string, value: unknown) => {
  Object.defineProperty(window.navigator, key, {
    configurable: true,
    value,
  });
};

const setWindowProperty = (key: string, value: unknown) => {
  Object.defineProperty(window, key, {
    configurable: true,
    value,
  });
};

describe('device and browser helpers', () => {
  it('detects iPhone and iPad desktop mode as Apple mobile', () => {
    expect(isAppleMobileDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)', 5)).toBe(true);
    expect(isAppleMobileDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4)', 5)).toBe(true);
    expect(isAppleMobileDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4)', 0)).toBe(false);
  });

  it('detects likely mobile devices', () => {
    expect(isLikelyMobileDevice('Mozilla/5.0 (Linux; Android 14; Pixel 9)', 5)).toBe(true);
    expect(isLikelyMobileDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4)', 0)).toBe(false);
  });

  it('maps browser names', () => {
    expect(
      getBrowserDisplayName(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      )
    ).toBe('Chrome');

    expect(
      getBrowserDisplayName(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
      )
    ).toBe('Safari');

    expect(
      getBrowserDisplayName(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4; rv:125.0) Gecko/20100101 Firefox/125.0'
      )
    ).toBe('Firefox');

    expect(
      getBrowserDisplayName(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Edg/124.0.0.0 Safari/537.36'
      )
    ).toBe('Edge');
  });
});

describe('isStandaloneDisplayMode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when navigator.standalone is enabled', () => {
    setNavigatorProperty('standalone', true);
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;

    expect(isStandaloneDisplayMode()).toBe(true);
  });

  it('returns true when display-mode media query matches', () => {
    setNavigatorProperty('standalone', false);
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia;

    expect(isStandaloneDisplayMode()).toBe(true);
  });

  it('returns false when neither standalone signal is present', () => {
    setNavigatorProperty('standalone', false);
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;

    expect(isStandaloneDisplayMode()).toBe(false);
  });
});

describe('push promo platform state', () => {
  it('classifies desktop supported state', () => {
    expect(
      resolvePushPromoPlatformState({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        maxTouchPoints: 0,
        isSecureContextValue: true,
        hasServiceWorker: true,
        hasPushManager: true,
        hasNotification: true,
        standalone: false,
      })
    ).toBe('desktop_supported');
  });

  it('classifies mobile browser state', () => {
    expect(
      resolvePushPromoPlatformState({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        maxTouchPoints: 5,
        isSecureContextValue: true,
        hasServiceWorker: true,
        hasPushManager: true,
        hasNotification: true,
        standalone: false,
      })
    ).toBe('mobile_browser');
  });

  it('classifies mobile standalone state', () => {
    expect(
      resolvePushPromoPlatformState({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        maxTouchPoints: 5,
        isSecureContextValue: true,
        hasServiceWorker: true,
        hasPushManager: true,
        hasNotification: true,
        standalone: true,
      })
    ).toBe('mobile_standalone');
  });

  it('classifies unsupported when push APIs are missing', () => {
    expect(
      resolvePushPromoPlatformState({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4)',
        maxTouchPoints: 0,
        isSecureContextValue: true,
        hasServiceWorker: false,
        hasPushManager: true,
        hasNotification: true,
        standalone: false,
      })
    ).toBe('unsupported');
  });
});

describe('runtime compatibility helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports eligible for supported desktop runtime', () => {
    setWindowProperty('isSecureContext', true);
    setNavigatorProperty(
      'userAgent',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    setNavigatorProperty('maxTouchPoints', 0);
    setNavigatorProperty('serviceWorker', {});
    setWindowProperty('PushManager', function PushManager() {});
    setWindowProperty('Notification', function Notification() {});
    setNavigatorProperty('standalone', false);
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;

    expect(getPushPromoPlatformState()).toBe('desktop_supported');
    expect(isEligibleForApplePushPromo()).toBe(true);
  });

  it('reports unsupported when context is insecure', () => {
    setWindowProperty('isSecureContext', false);
    setNavigatorProperty('userAgent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)');
    setNavigatorProperty('maxTouchPoints', 5);
    setNavigatorProperty('serviceWorker', {});
    setWindowProperty('PushManager', function PushManager() {});
    setWindowProperty('Notification', function Notification() {});
    setNavigatorProperty('standalone', false);
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;

    expect(getPushPromoPlatformState()).toBe('unsupported');
    expect(isEligibleForApplePushPromo()).toBe(false);
  });
});
