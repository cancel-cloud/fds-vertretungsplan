import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardClient } from '@/components/stundenplan/dashboard-client';

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  router: {
    push: vi.fn(),
    replace: vi.fn(),
  },
  captureMock: vi.fn(),
  eligibleMock: vi.fn(() => true),
  standaloneMock: vi.fn(() => false),
  dismissedMock: vi.fn(() => false),
  pathname: '/stundenplan/dashboard',
  searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mocks.router,
  usePathname: () => mocks.pathname,
  useSearchParams: () => ({
    get: (key: string) => mocks.searchParams.get(key),
    toString: () => mocks.searchParams.toString(),
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

vi.mock('@/components/calendar-widget', () => ({
  CalendarWidget: ({ onDateSelect }: { onDateSelect: (date: Date) => void }) => (
    <div>
      <p>Kalender-Widget</p>
      <button type="button" onClick={() => onDateSelect(new Date(2026, 1, 17))}>
        Datum im Kalender wählen
      </button>
    </div>
  ),
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
    mocks.router.push = mocks.routerPush;
    mocks.router.replace = mocks.routerReplace;
    mocks.eligibleMock.mockReturnValue(true);
    mocks.standaloneMock.mockReturnValue(false);
    mocks.dismissedMock.mockReturnValue(false);
    mocks.pathname = '/stundenplan/dashboard';
    mocks.searchParams = new URLSearchParams();
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

  it('opens the calendar dialog from the desktop date trigger', async () => {
    renderDashboard(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ausgewähltes datum/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Datum wählen')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Datum im Kalender wählen' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('keeps guests out of the personal empty state and normalizes personal scope in the URL', async () => {
    mocks.searchParams = new URLSearchParams('scope=personal');
    const fetchMock = vi.fn(async () => createJsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    render(<DashboardClient initialScope="all" isAuthenticated={false} />);

    await waitFor(() => {
      expect(mocks.routerReplace).toHaveBeenCalledWith('/stundenplan/dashboard?scope=all', { scroll: false });
    });

    expect(screen.queryByText(/Kein Stundenplan hinterlegt/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Stundenplan bearbeiten' })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('builds the guest login promo from the current route and query', () => {
    mocks.searchParams = new URLSearchParams('date=20260218&search=Bio');
    vi.stubGlobal('fetch', vi.fn(async () => createJsonResponse({})));

    render(<DashboardClient initialScope="all" isAuthenticated={false} />);

    const loginLinks = screen.getAllByRole('link', { name: 'Zum Login' });
    expect(
      loginLinks.every(
        (link) =>
          link.getAttribute('href') ===
          '/stundenplan/login?next=%2Fstundenplan%2Fdashboard%3Fdate%3D20260218%26search%3DBio'
      )
    ).toBe(true);
  });

  it('keeps guest quick-date navigation on public scope after normalization', async () => {
    mocks.searchParams = new URLSearchParams('scope=personal');
    vi.stubGlobal('fetch', vi.fn(async () => createJsonResponse({})));

    render(<DashboardClient initialScope="all" isAuthenticated={false} />);

    const [chip] = await screen.findAllByRole('button', { name: /\d{2}\.\d{2}/ });
    fireEvent.click(chip);

    await waitFor(() => {
      expect(mocks.routerReplace).toHaveBeenLastCalledWith(expect.stringContaining('scope=all'), { scroll: false });
    });
  });
});
