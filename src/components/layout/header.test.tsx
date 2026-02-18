import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/layout/header';

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

describe('Header', () => {
  it('renders menu toggle with accessibility wiring and theme toggle', () => {
    const onMenuToggle = vi.fn();

    render(<Header onMenuToggle={onMenuToggle} isMenuOpen={false} menuId="app-shell-mobile-menu" />);

    const toggleButton = screen.getByRole('button', { name: 'Menü öffnen' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-controls', 'app-shell-mobile-menu');
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it('renders close semantics when menu is open', () => {
    render(<Header onMenuToggle={() => {}} isMenuOpen menuId="app-shell-mobile-menu" />);

    const toggleButton = screen.getByRole('button', { name: 'Menü schließen' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });
});
