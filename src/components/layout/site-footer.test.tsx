import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SiteFooter } from '@/components/layout/site-footer';

describe('SiteFooter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows measured initial load time, owner name, and animated mail link', () => {
    vi.spyOn(window.performance, 'getEntriesByType').mockReturnValue([
      { duration: 123.4 } as PerformanceNavigationTiming,
    ]);

    render(<SiteFooter />);

    expect(screen.getByText('Ladezeit: 123 ms')).toBeInTheDocument();
    expect(screen.getByText('Lukas')).toBeInTheDocument();

    const emailLink = screen.getByRole('link', { name: 'Email me' });
    expect(emailLink).toHaveAttribute('href', 'mailto:malven-02.taktik@icloud.com');
    expect(emailLink).toHaveClass('motion-link-underline');
    expect(emailLink).toHaveClass('motion-safe-base');
  });

  it('falls back to n/a when navigation timing is unavailable', () => {
    vi.spyOn(window.performance, 'getEntriesByType').mockReturnValue([]);

    render(<SiteFooter />);

    expect(screen.getByText('Ladezeit: n/a')).toBeInTheDocument();
  });
});
