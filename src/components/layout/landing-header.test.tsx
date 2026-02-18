import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LandingHeader } from '@/components/layout/landing-header';

const mocks = vi.hoisted(() => ({
  getServerAuthSession: vi.fn(),
  captureClientEvent: vi.fn(),
  signOut: vi.fn(),
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
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  buttonVariants: () => 'btn',
}));

vi.mock('@/lib/analytics/posthog-client', () => ({
  captureClientEvent: mocks.captureClientEvent,
}));

vi.mock('next-auth/react', () => ({
  signOut: mocks.signOut,
}));

describe('LandingHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('links guests to login with next=/', async () => {
    mocks.getServerAuthSession.mockResolvedValue(null);

    render(await LandingHeader());

    const loginLinks = screen.getAllByRole('link', { name: 'Login' });
    expect(loginLinks.some((link) => link.getAttribute('href') === '/stundenplan/login?next=/')).toBe(true);
    expect(screen.getByRole('button', { name: 'Menü öffnen' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: 'Menü öffnen' })).toBeInTheDocument();
  });

  it('opens the mobile menu and tracks toggle analytics', async () => {
    mocks.getServerAuthSession.mockResolvedValue(null);

    render(await LandingHeader());

    fireEvent.click(screen.getByRole('button', { name: 'Menü öffnen' }));

    const menuToggleButton = screen
      .getAllByRole('button', { name: 'Menü schließen' })
      .find((button) => button.getAttribute('aria-controls') === 'landing-mobile-menu');
    expect(menuToggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(mocks.captureClientEvent).toHaveBeenCalledWith('mobile_menu_toggled', {
      open: true,
      header: 'landing',
    });
  });
});
