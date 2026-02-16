import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardClient } from '@/components/stundenplan/dashboard-client';

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  captureMock: vi.fn(),
  eligibleMock: vi.fn(() => true),
  standaloneMock: vi.fn(() => false),
  dismissedMock: vi.fn(() => false),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
    replace: mocks.routerReplace,
  }),
  usePathname: () => '/stundenplan/dashboard',
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
}));

vi.mock('@/hooks/use-substitutions', () => ({
  useSubstitutions: () => ({
    substitutions: [],
    isLoading: false,
    error: null,
    metaResponse: null,
    resolvedDateKey: '20260216',
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-substitution-polling', () => ({
  useSubstitutionPolling: vi.fn(),
}));

vi.mock('@/providers/posthog-provider', () => ({
  usePostHogContext: () => ({
    capture: mocks.captureMock,
    isFeatureEnabled: vi.fn(),
    getFlagNumber: vi.fn(),
    featureFlagsReady: true,
    deviceId: 'test-device',
  }),
}));

vi.mock('@/lib/apple-device', () => ({
  getPushPromoPlatformState: () => (mocks.eligibleMock() ? 'desktop_supported' : 'unsupported'),
  getBrowserDisplayName: () => 'Safari',
  isStandaloneDisplayMode: mocks.standaloneMock,
}));

vi.mock('@/lib/promo-dismissal', () => ({
  isApplePushPromoDismissed: mocks.dismissedMock,
  dismissApplePushPromo: vi.fn(),
}));

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('DashboardClient Apple push promo integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.eligibleMock.mockReturnValue(true);
    mocks.standaloneMock.mockReturnValue(false);
    mocks.dismissedMock.mockReturnValue(false);
  });

  const renderDashboard = (notificationsEnabled: boolean) => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/me')) {
        return createJsonResponse({
          user: {
            id: 'u1',
            email: 'test@example.com',
            role: 'USER',
            onboardingCompletedAt: '2026-02-01T00:00:00.000Z',
            onboardingSkippedAt: null,
            notificationsEnabled,
            notificationLookaheadSchoolDays: 1,
          },
        });
      }

      if (url.includes('/api/timetable')) {
        return createJsonResponse({
          entries: [
            {
              id: 'entry-1',
              weekday: 'MON',
              startPeriod: 1,
              duration: 1,
              subjectCode: 'MATH',
              teacherCode: 'AB',
              room: '101',
              weekMode: 'ALL',
            },
          ],
        });
      }

      return createJsonResponse({});
    });

    vi.stubGlobal('fetch', fetchMock);
    render(<DashboardClient initialScope="personal" isAuthenticated />);
    return fetchMock;
  };

  it('shows promo when push is disabled', async () => {
    const fetchMock = renderDashboard(false);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getAllByText('Push Notifications').length).toBeGreaterThan(0);
    });
  });

  it('hides promo when push is already enabled', async () => {
    const fetchMock = renderDashboard(true);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByText('Push Notifications')).not.toBeInTheDocument();
    });
  });

  it('hides promo for unsupported users', async () => {
    mocks.eligibleMock.mockReturnValue(false);
    const fetchMock = renderDashboard(false);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByText('Push Notifications')).not.toBeInTheDocument();
    });
  });
});
