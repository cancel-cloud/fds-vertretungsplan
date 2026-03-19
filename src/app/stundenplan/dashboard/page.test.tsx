import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '@/app/stundenplan/dashboard/page';

const mocks = vi.hoisted(() => ({
  getOptionalSignedInUser: vi.fn(),
  redirectIfBootstrapAdminRegistrationRequired: vi.fn(),
  redirectIfAdminSetupRequired: vi.fn(),
  isDemoMode: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('@/lib/stundenplan-page-guards', () => ({
  getOptionalSignedInUser: mocks.getOptionalSignedInUser,
  redirectIfBootstrapAdminRegistrationRequired: mocks.redirectIfBootstrapAdminRegistrationRequired,
  redirectIfAdminSetupRequired: mocks.redirectIfAdminSetupRequired,
}));

vi.mock('@/lib/demo-config', () => ({
  isDemoMode: mocks.isDemoMode,
}));

vi.mock('@/components/layout/landing-header', () => ({
  LandingHeader: () => <div data-testid="landing-header">Header</div>,
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

describe('StundenplanDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOptionalSignedInUser.mockResolvedValue(null);
    mocks.redirectIfBootstrapAdminRegistrationRequired.mockResolvedValue(undefined);
    mocks.redirectIfAdminSetupRequired.mockResolvedValue(undefined);
    mocks.isDemoMode.mockReturnValue(false);
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it('redirects guests with personal scope to the public lite view and preserves the current query', async () => {
    await expect(
      DashboardPage({
        searchParams: Promise.resolve({
          scope: 'personal',
          date: '20260218',
          search: 'Bio',
        }),
      })
    ).rejects.toThrow('REDIRECT:/?scope=all&date=20260218&search=Bio');
  });

  it('renders the public dashboard for guests with all scope', async () => {
    const page = await DashboardPage({
      searchParams: Promise.resolve({
        scope: 'all',
      }),
    });
    render(page);

    expect(screen.getByTestId('landing-header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-scope', 'all');
    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-authenticated', 'false');
  });

  it('redirects to bootstrap registration before guest personal-lite fallback when no admin exists', async () => {
    mocks.redirectIfBootstrapAdminRegistrationRequired.mockImplementation(async () => {
      throw new Error('REDIRECT:/stundenplan/register');
    });

    await expect(
      DashboardPage({
        searchParams: Promise.resolve({
          scope: 'personal',
        }),
      })
    ).rejects.toThrow('REDIRECT:/stundenplan/register');

    expect(mocks.redirect).not.toHaveBeenCalledWith('/?scope=all');
  });
});
