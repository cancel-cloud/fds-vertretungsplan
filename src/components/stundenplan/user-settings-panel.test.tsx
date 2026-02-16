import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserSettingsPanel } from '@/components/stundenplan/user-settings-panel';

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  isPushSupportedMock: vi.fn(() => true),
  getExistingPushEndpointMock: vi.fn<() => Promise<string | null>>(),
  ensureNotificationPermissionMock: vi.fn<() => Promise<{ ok: boolean; reason?: string }>>(),
  ensureCurrentSubscriptionMock: vi.fn<() => Promise<{ endpoint: string }>>(),
  persistPushSubscriptionMock: vi.fn<() => Promise<void>>(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}));

vi.mock('@/lib/push-client', () => ({
  isPushSupported: mocks.isPushSupportedMock,
  getExistingPushEndpoint: mocks.getExistingPushEndpointMock,
  ensureNotificationPermission: mocks.ensureNotificationPermissionMock,
  ensureCurrentSubscription: mocks.ensureCurrentSubscriptionMock,
  persistPushSubscription: mocks.persistPushSubscriptionMock,
}));

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const meUser = {
  notificationsEnabled: false,
  notificationLookaheadSchoolDays: 1,
};

describe('UserSettingsPanel current-device push control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isPushSupportedMock.mockReturnValue(true);
    mocks.getExistingPushEndpointMock.mockResolvedValue(null);
    mocks.ensureNotificationPermissionMock.mockResolvedValue({ ok: true });
    mocks.ensureCurrentSubscriptionMock.mockResolvedValue({ endpoint: 'https://push.example/current' });
    mocks.persistPushSubscriptionMock.mockResolvedValue(undefined);
  });

  it('shows "Aktiv (dieses Gerät)" when current endpoint is already registered', async () => {
    mocks.getExistingPushEndpointMock.mockResolvedValue('https://push.example/current');

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/me')) {
        return createJsonResponse({ user: meUser });
      }
      if (url.includes('/api/push/subscriptions')) {
        return createJsonResponse({
          subscriptions: [
            {
              id: 'device-1',
              endpoint: 'https://push.example/current',
              userAgent: 'Mozilla/5.0',
              createdAt: '2026-02-16T10:00:00.000Z',
              lastSeenAt: '2026-02-16T10:15:00.000Z',
            },
          ],
        });
      }
      return createJsonResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<UserSettingsPanel />);

    expect(await screen.findByRole('button', { name: 'Aktiv (dieses Gerät)' })).toBeDisabled();
  });

  it('shows "Aktivieren (dieses Gerät)" when endpoint is not registered', async () => {
    mocks.getExistingPushEndpointMock.mockResolvedValue(null);

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/me')) {
        return createJsonResponse({ user: meUser });
      }
      if (url.includes('/api/push/subscriptions')) {
        return createJsonResponse({ subscriptions: [] });
      }
      return createJsonResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<UserSettingsPanel />);

    expect(await screen.findByRole('button', { name: 'Aktivieren (dieses Gerät)' })).toBeEnabled();
  });

  it('activates current device and flips to active status', async () => {
    mocks.getExistingPushEndpointMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('https://push.example/current');

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/me') && (!init || init.method === 'GET')) {
        return createJsonResponse({ user: meUser });
      }
      if (url.includes('/api/me') && init?.method === 'PUT') {
        return createJsonResponse({ user: { ...meUser, notificationsEnabled: true } });
      }
      if (url.includes('/api/push/subscriptions')) {
        return createJsonResponse({
          subscriptions: [
            {
              id: 'device-1',
              endpoint: 'https://push.example/current',
              userAgent: 'Mozilla/5.0',
              createdAt: '2026-02-16T10:00:00.000Z',
              lastSeenAt: '2026-02-16T10:15:00.000Z',
            },
          ],
        });
      }
      return createJsonResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<UserSettingsPanel />);

    await user.click(await screen.findByRole('button', { name: 'Aktivieren (dieses Gerät)' }));

    await waitFor(() => {
      expect(mocks.ensureNotificationPermissionMock).toHaveBeenCalledTimes(1);
      expect(mocks.ensureCurrentSubscriptionMock).toHaveBeenCalledTimes(1);
      expect(mocks.persistPushSubscriptionMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByRole('button', { name: 'Aktiv (dieses Gerät)' })).toBeDisabled();
    expect(await screen.findByText('Dieses Gerät wurde für Push registriert.')).toBeInTheDocument();
  });

  it('shows unavailable status when push is unsupported', async () => {
    mocks.isPushSupportedMock.mockReturnValue(false);

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/me')) {
        return createJsonResponse({ user: meUser });
      }
      if (url.includes('/api/push/subscriptions')) {
        return createJsonResponse({ subscriptions: [] });
      }
      return createJsonResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<UserSettingsPanel />);

    expect(await screen.findByRole('button', { name: 'Auf diesem Gerät nicht verfügbar' })).toBeDisabled();
  });

  it('switches back to activate when current device is deactivated in list', async () => {
    mocks.getExistingPushEndpointMock.mockResolvedValue('https://push.example/current');

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/me')) {
        return createJsonResponse({ user: meUser });
      }
      if (url.includes('/api/push/subscriptions')) {
        return createJsonResponse({
          subscriptions: [
            {
              id: 'device-1',
              endpoint: 'https://push.example/current',
              userAgent: 'Mozilla/5.0',
              createdAt: '2026-02-16T10:00:00.000Z',
              lastSeenAt: '2026-02-16T10:15:00.000Z',
            },
          ],
        });
      }
      if (url.includes('/api/push/unsubscribe') && init?.method === 'DELETE') {
        return createJsonResponse({ ok: true });
      }
      return createJsonResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<UserSettingsPanel />);

    expect(await screen.findByRole('button', { name: 'Aktiv (dieses Gerät)' })).toBeDisabled();
    await user.click(await screen.findByRole('button', { name: 'Deaktivieren' }));

    expect(await screen.findByRole('button', { name: 'Aktivieren (dieses Gerät)' })).toBeEnabled();
  });
});
