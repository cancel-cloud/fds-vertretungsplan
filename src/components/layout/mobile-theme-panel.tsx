'use client';

import { ThemeToggle } from '@/components/theme-toggle';

export function MobileThemePanel() {
  return (
    <div className="flex items-center justify-between border-t border-[rgb(var(--color-border)/0.2)] pt-4">
      <span className="text-[rgb(var(--color-text-secondary))]">Theme</span>
      <ThemeToggle />
    </div>
  );
}
