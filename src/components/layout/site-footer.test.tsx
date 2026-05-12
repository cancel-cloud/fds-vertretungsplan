import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SiteFooter } from '@/components/layout/site-footer';

describe('SiteFooter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows measured initial load time, legal links, and contact link', () => {
    vi.spyOn(window.performance, 'getEntriesByType').mockReturnValue([
      { duration: 123.4 } as PerformanceNavigationTiming,
    ]);

    render(<SiteFooter />);

    expect(screen.getByText('Ladezeit: 123 ms')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Impressum' })).toHaveAttribute('href', '/impressum');
    expect(screen.getByRole('link', { name: 'Datenschutz' })).toHaveAttribute('href', '/datenschutz');
    expect(screen.queryByText('Lukas')).not.toBeInTheDocument();

    const emailLink = screen.getByRole('link', { name: 'Kontakt' });
    expect(emailLink).toHaveAttribute('href', 'mailto:malven-02.taktik@icloud.com');
    expect(emailLink).toHaveClass('motion-link-underline');
    expect(emailLink).toHaveClass('motion-safe-base');
  });

  it('uses completed navigation timing fields when duration is zero', () => {
    vi.spyOn(window.performance, 'getEntriesByType').mockReturnValue([
      {
        duration: 0,
        startTime: 0,
        loadEventEnd: 0,
        domComplete: 465,
        domContentLoadedEventEnd: 420,
        responseEnd: 300,
      } as PerformanceNavigationTiming,
    ]);

    render(<SiteFooter />);

    expect(screen.getByText('Ladezeit: 465 ms')).toBeInTheDocument();
  });

  it('uses legacy performance timing when navigation entry is unavailable', () => {
    vi.spyOn(window.performance, 'getEntriesByType').mockReturnValue([]);
    Object.defineProperty(window.performance, 'timing', {
      configurable: true,
      value: {
        navigationStart: 1000,
        loadEventEnd: 1465,
      } as PerformanceTiming,
    });

    render(<SiteFooter />);

    expect(screen.getByText('Ladezeit: 465 ms')).toBeInTheDocument();
  });

  it('falls back to n/a when no completed timing is available', () => {
    vi.spyOn(window.performance, 'getEntriesByType').mockReturnValue([
      {
        duration: 0,
        startTime: 0,
        loadEventEnd: 0,
        domComplete: 0,
        domContentLoadedEventEnd: 0,
        responseEnd: 0,
      } as PerformanceNavigationTiming,
    ]);
    Object.defineProperty(window.performance, 'timing', {
      configurable: true,
      value: undefined,
    });

    render(<SiteFooter />);

    expect(screen.getByText('Ladezeit: n/a')).toBeInTheDocument();
  });
});
