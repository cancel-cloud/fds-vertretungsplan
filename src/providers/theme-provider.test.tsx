import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from '@/providers/theme-provider';

const captureClientEventMock = vi.fn();

vi.mock('@/lib/analytics/posthog-client', () => ({
  captureClientEvent: (...args: unknown[]) => captureClientEventMock(...args),
}));

interface MatchMediaController {
  setMatches: (next: boolean) => void;
}

const setupMatchMedia = (initialMatches: boolean): MatchMediaController => {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: vi.fn(),
    })),
  });

  return {
    setMatches(next: boolean) {
      matches = next;
      const event = { matches } as MediaQueryListEvent;
      for (const listener of listeners) {
        listener(event);
      }
    },
  };
};

function ThemeProbe() {
  const { theme } = useTheme();
  return <div data-testid="theme-value">{theme}</div>;
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    captureClientEventMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to system theme when no stored preference exists', async () => {
    setupMatchMedia(true);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('system');
    });
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('applies system theme based on current color scheme and updates on OS changes', async () => {
    const mediaQuery = setupMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('system');
    });
    expect(document.documentElement).toHaveClass('light');

    mediaQuery.setMatches(true);

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
  });
});
