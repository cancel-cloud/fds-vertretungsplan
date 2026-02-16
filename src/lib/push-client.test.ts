import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ensureNotificationPermission, getExistingPushEndpoint } from '@/lib/push-client';

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

describe('push-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setWindowProperty('isSecureContext', true);
    setWindowProperty('PushManager', function PushManager() {});
  });

  it('getExistingPushEndpoint returns null when no subscription exists', async () => {
    const getSubscriptionMock = vi.fn().mockResolvedValue(null);
    setNavigatorProperty('serviceWorker', {
      register: vi.fn().mockResolvedValue(undefined),
      ready: Promise.resolve({
        pushManager: {
          getSubscription: getSubscriptionMock,
        },
      }),
    });
    setWindowProperty('Notification', {
      permission: 'granted',
      requestPermission: vi.fn(),
    } as unknown as typeof Notification);

    const endpoint = await getExistingPushEndpoint();
    expect(endpoint).toBeNull();
    expect(getSubscriptionMock).toHaveBeenCalledTimes(1);
  });

  it('getExistingPushEndpoint returns endpoint when subscription exists', async () => {
    const getSubscriptionMock = vi.fn().mockResolvedValue({
      endpoint: 'https://push.example/device-1',
    });
    setNavigatorProperty('serviceWorker', {
      register: vi.fn().mockResolvedValue(undefined),
      ready: Promise.resolve({
        pushManager: {
          getSubscription: getSubscriptionMock,
        },
      }),
    });
    setWindowProperty('Notification', {
      permission: 'granted',
      requestPermission: vi.fn(),
    } as unknown as typeof Notification);

    const endpoint = await getExistingPushEndpoint();
    expect(endpoint).toBe('https://push.example/device-1');
    expect(getSubscriptionMock).toHaveBeenCalledTimes(1);
  });

  it('ensureNotificationPermission handles granted/default/denied', async () => {
    setWindowProperty('Notification', {
      permission: 'granted',
      requestPermission: vi.fn(),
    } as unknown as typeof Notification);
    expect(await ensureNotificationPermission()).toEqual({ ok: true });

    const requestPermissionGranted = vi.fn().mockResolvedValue('granted');
    setWindowProperty('Notification', {
      permission: 'default',
      requestPermission: requestPermissionGranted,
    } as unknown as typeof Notification);
    expect(await ensureNotificationPermission()).toEqual({ ok: true });

    const requestPermissionDefault = vi.fn().mockResolvedValue('default');
    setWindowProperty('Notification', {
      permission: 'default',
      requestPermission: requestPermissionDefault,
    } as unknown as typeof Notification);
    expect(await ensureNotificationPermission()).toEqual({ ok: false, reason: 'permission_prompt_not_confirmed' });

    setWindowProperty('Notification', {
      permission: 'denied',
      requestPermission: vi.fn(),
    } as unknown as typeof Notification);
    expect(await ensureNotificationPermission()).toEqual({ ok: false, reason: 'permission_denied' });
  });
});
