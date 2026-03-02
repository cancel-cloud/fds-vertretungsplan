'use client';

import { useEffect, useState } from 'react';

const isValidDuration = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const readNavigationEntryDuration = (): number | null => {
  if (typeof window === 'undefined' || typeof window.performance === 'undefined') {
    return null;
  }

  const navigationEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!navigationEntry) {
    return null;
  }

  if (isValidDuration(navigationEntry.duration)) {
    return Math.round(navigationEntry.duration);
  }

  return null;
};

const readLegacyTimingDuration = (): number | null => {
  if (typeof window === 'undefined' || typeof window.performance === 'undefined') {
    return null;
  }

  const timing = window.performance.timing;
  if (!timing || !isValidDuration(timing.navigationStart)) {
    return null;
  }

  const endCandidates = [
    timing.loadEventEnd,
    timing.domComplete,
    timing.domContentLoadedEventEnd,
    timing.responseEnd,
  ];
  const end = endCandidates.find((candidate) => isValidDuration(candidate) && candidate > timing.navigationStart);
  if (typeof end !== 'number') {
    return null;
  }

  return Math.round(end - timing.navigationStart);
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
