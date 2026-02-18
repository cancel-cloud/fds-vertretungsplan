import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LandingHeader } from '@/components/layout/landing-header';

const mocks = vi.hoisted(() => ({
  getServerAuthSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getServerAuthSession: mocks.getServerAuthSession,
}));

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock('@/components/layout/header-auth-actions', () => ({
  HeaderAuthActions: ({ role }: { role: 'USER' | 'ADMIN' }) => (
    <div data-testid="header-auth-actions" data-role={role} />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  buttonVariants: () => 'btn',
}));

describe('LandingHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('links guests to login with next=/', async () => {
    mocks.getServerAuthSession.mockResolvedValue(null);

    render(await LandingHeader());

    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/stundenplan/login?next=/');
    expect(screen.queryByTestId('header-auth-actions')).not.toBeInTheDocument();
  });

  it('shows auth actions for authenticated users', async () => {
    mocks.getServerAuthSession.mockResolvedValue({
      user: {
        id: 'admin-1',
        role: 'ADMIN',
      },
    });

    render(await LandingHeader());

    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
    expect(screen.getByTestId('header-auth-actions')).toHaveAttribute('data-role', 'ADMIN');
  });
});
