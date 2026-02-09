'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeMode } from '@/types';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { captureClientEvent } from '@/lib/analytics/posthog-client';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
}

const STORAGE_KEY = 'theme';
const themes: ThemeMode[] = ['system', 'light', 'dark'];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((newTheme: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
      return;
    }

    root.classList.add(newTheme);
  }, []);

  useEffect(() => {
    setMounted(true);

    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      const parsedTheme = themes.includes(savedTheme as ThemeMode)
        ? (savedTheme as ThemeMode)
        : 'light';

      setThemeState(parsedTheme);
      applyTheme(parsedTheme);
    } catch {
      applyTheme('light');
    }
  }, [applyTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      applyTheme(newTheme);

      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {
        // no-op for private mode
      }

      captureClientEvent(ANALYTICS_EVENTS.THEME_CHANGED, { theme: newTheme });
    },
    [applyTheme]
  );

  const cycleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const currentIndex = themes.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      const nextTheme = themes[nextIndex];

      applyTheme(nextTheme);
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {
        // no-op
      }

      captureClientEvent(ANALYTICS_EVENTS.THEME_CHANGED, { theme: nextTheme });
      return nextTheme;
    });
  }, [applyTheme]);

  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      cycleTheme,
    }),
    [cycleTheme, setTheme, theme]
  );

  if (!mounted) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
