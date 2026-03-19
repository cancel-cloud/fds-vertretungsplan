'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const isValidDuration = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const readCompletedDuration = (start: unknown, ...endCandidates: unknown[]): number | null => {
  if (!isValidDuration(start)) {
    return null;
  }

  const end = endCandidates.find((candidate) => isValidDuration(candidate) && candidate > start);
  if (typeof end !== 'number') {
    return null;
  }

  const duration = Math.round(end - start);
  return duration > 0 ? duration : null;
};

const readNavigationEntryDuration = (): number | null => {
  if (typeof window === 'undefined' || typeof window.performance === 'undefined') {
    return null;
  }

  const navigationEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!navigationEntry) {
    return null;
  }

  if (isValidDuration(navigationEntry.duration)) {
    const roundedDuration = Math.round(navigationEntry.duration);
    if (roundedDuration > 0) {
      return roundedDuration;
    }
  }

  return readCompletedDuration(
    navigationEntry.startTime,
    navigationEntry.loadEventEnd,
    navigationEntry.domComplete,
    navigationEntry.domContentLoadedEventEnd,
    navigationEntry.responseEnd
  );
};

const readLegacyTimingDuration = (): number | null => {
  if (typeof window === 'undefined' || typeof window.performance === 'undefined') {
    return null;
  }

  const timing = window.performance.timing;
  if (!timing || !isValidDuration(timing.navigationStart)) {
    return null;
  }

  return readCompletedDuration(
    timing.navigationStart,
    timing.loadEventEnd,
    timing.domComplete,
    timing.domContentLoadedEventEnd,
    timing.responseEnd
  );
};

const readInitialLoadDuration = (): number | null => {
  return readNavigationEntryDuration() ?? readLegacyTimingDuration();
};

export function SiteFooter() {
  const [initialLoadDuration, setInitialLoadDuration] = useState<number | null>(null);

  useEffect(() => {
    const updateLoadDuration = () => {
      setInitialLoadDuration(readInitialLoadDuration());
    };

    updateLoadDuration();

    if (document.readyState === 'complete') {
      return undefined;
    }

    window.addEventListener('load', updateLoadDuration, { once: true });

    return () => {
      window.removeEventListener('load', updateLoadDuration);
    };
  }, []);

  return (
    <footer className="border-t border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))]">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-[rgb(var(--color-text-secondary))] md:px-6">
        <span>Ladezeit: {initialLoadDuration === null ? 'n/a' : `${initialLoadDuration} ms`}</span>
        <nav aria-label="Rechtliches und Kontakt" className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <Link
            href="/impressum"
            className="motion-link-underline motion-safe-base rounded-sm px-1 py-0.5 -mx-1 -my-0.5 hover:text-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-offset-2"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="motion-link-underline motion-safe-base rounded-sm px-1 py-0.5 -mx-1 -my-0.5 hover:text-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-offset-2"
          >
            Datenschutz
          </Link>
          <a
            href="mailto:malven-02.taktik@icloud.com"
            className="motion-link-underline motion-safe-base rounded-sm px-1 py-0.5 -mx-1 -my-0.5 hover:text-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-offset-2"
          >
            Kontakt
          </a>
        </nav>
      </div>
    </footer>
  );
}
