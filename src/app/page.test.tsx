import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/page';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  teacherCount: vi.fn(),
  isDemoMode: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('@/lib/auth/guards', () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    teacherDirectory: {
      count: mocks.teacherCount,
    },
  },
}));

vi.mock('@/lib/demo-config', () => ({
  isDemoMode: mocks.isDemoMode,
}));

vi.mock('@/components/layout/landing-header', () => ({
  LandingHeader: () => <div data-testid="landing-header">Header</div>,
}));

vi.mock('@/components/newui/new-ui-client', () => ({
  NewUiClient: ({
    analyticsSource,
    showLoginPromo,
    isDemoMode,
  }: {
    analyticsSource: string;
    showLoginPromo?: boolean;
    isDemoMode?: boolean;
  }) => (
    <div
      data-testid="newui-client"
      data-analytics-source={analyticsSource}
      data-show-login-promo={String(Boolean(showLoginPromo))}
      data-demo-mode={String(Boolean(isDemoMode))}
    />
  ),
}));

vi.mock('@/components/stundenplan/dashboard-client', () => ({
  DashboardClient: ({
    initialScope,
    isAuthenticated,
    isDemoMode,
  }: {
    initialScope: string;
    isAuthenticated: boolean;
    isDemoMode?: boolean;
  }) => (
    <div
      data-testid="dashboard-client"
      data-scope={initialScope}
      data-authenticated={String(Boolean(isAuthenticated))}
      data-demo-mode={String(Boolean(isDemoMode))}
    />
  ),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(null);
    mocks.teacherCount.mockResolvedValue(1);
    mocks.isDemoMode.mockReturnValue(false);
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it('renders public homepage for guests with login promo', async () => {
    const page = await HomePage({});
    render(page);

    expect(screen.getByTestId('landing-header')).toBeInTheDocument();
    expect(screen.getByTestId('newui-client')).toHaveAttribute('data-analytics-source', 'home_default');
    expect(screen.getByTestId('newui-client')).toHaveAttribute('data-show-login-promo', 'true');
    expect(screen.queryByTestId('dashboard-client')).not.toBeInTheDocument();
  });

  it('renders dashboard for authenticated users with default personal scope', async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      role: 'USER',
      onboardingCompletedAt: '2026-02-01T00:00:00.000Z',
      onboardingSkippedAt: null,
    });

    const page = await HomePage({});
    render(page);

    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-scope', 'personal');
    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-authenticated', 'true');
    expect(screen.queryByTestId('newui-client')).not.toBeInTheDocument();
  });

  it('redirects admins without teachers to admin setup', async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: 'admin-1',
      role: 'ADMIN',
      onboardingCompletedAt: '2026-02-01T00:00:00.000Z',
      onboardingSkippedAt: null,
    });
    mocks.teacherCount.mockResolvedValue(0);

    await expect(HomePage({})).rejects.toThrow('REDIRECT:/stundenplan/admin-setup');
    expect(mocks.redirect).toHaveBeenCalledWith('/stundenplan/admin-setup');
  });

  it('redirects authenticated users without onboarding completion to onboarding', async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      role: 'USER',
      onboardingCompletedAt: null,
      onboardingSkippedAt: null,
    });

    await expect(HomePage({})).rejects.toThrow('REDIRECT:/stundenplan/onboarding');
    expect(mocks.redirect).toHaveBeenCalledWith('/stundenplan/onboarding');
  });

  it('uses scope=all from root query params for authenticated users', async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      role: 'USER',
      onboardingCompletedAt: '2026-02-01T00:00:00.000Z',
      onboardingSkippedAt: null,
    });

    const page = await HomePage({
      searchParams: Promise.resolve({
        scope: 'all',
      }),
    });
    render(page);

    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-scope', 'all');
  });
});
