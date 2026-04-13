import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/page';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  teacherCount: vi.fn(),
  adminCount: vi.fn(),
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
    user: {
      count: mocks.adminCount,
    },
  },
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

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(null);
    mocks.teacherCount.mockResolvedValue(1);
    mocks.adminCount.mockResolvedValue(1);
    mocks.isDemoMode.mockReturnValue(false);
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it('renders shared dashboard for guests with public scope', async () => {
    const page = await HomePage({});
    render(page);

    expect(screen.getByTestId('landing-header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-scope', 'all');
    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-authenticated', 'false');
    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-demo-mode', 'false');
  });

  it('keeps guests on public scope even when the root query requests personal', async () => {
    const page = await HomePage({
      searchParams: Promise.resolve({
        scope: 'personal',
      }),
    });
    render(page);

    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-scope', 'all');
    expect(screen.getByTestId('dashboard-client')).toHaveAttribute('data-authenticated', 'false');
  });

  it('redirects guests to registration before the first admin exists', async () => {
    mocks.adminCount.mockResolvedValue(0);

    await expect(HomePage({})).rejects.toThrow('REDIRECT:/stundenplan/register');
    expect(mocks.redirect).toHaveBeenCalledWith('/stundenplan/register');
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
