'use client';

import { useEffect, useState } from 'react';

const readInitialLoadDuration = (): number | null => {
  if (typeof window === 'undefined' || typeof window.performance === 'undefined') {
    return null;
  }

  const navigationEntry = window.performance.getEntriesByType('navigation')[0];
  if (navigationEntry && Number.isFinite(navigationEntry.duration) && navigationEntry.duration >= 0) {
    return Math.round(navigationEntry.duration);
  }

  return null;
};

export function SiteFooter() {
  const [initialLoadDuration, setInitialLoadDuration] = useState<number | null>(null);

  useEffect(() => {
    setInitialLoadDuration(readInitialLoadDuration());
  }, []);

  return (
    <footer className="border-t border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))]">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-[rgb(var(--color-text-secondary))] md:px-6">
        <span>Ladezeit: {initialLoadDuration === null ? 'n/a' : `${initialLoadDuration} ms`}</span>
        <span>Lukas</span>
        <a
          href="mailto:malven-02.taktik@icloud.com"
          className="motion-link-underline motion-safe-base rounded-sm px-1 py-0.5 -mx-1 -my-0.5 hover:text-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-offset-2"
        >
          Email me
        </a>
      </div>
    </footer>
  );
}
