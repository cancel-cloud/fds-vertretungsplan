'use client';

import { useEffect, useRef, useCallback } from 'react';
import { formatDateForApi } from '@/lib/utils';
import { processApiResponse } from '@/lib/data-processing';
import { findRelevantSubstitutions, TimetableMatchEntry } from '@/lib/schedule-matching';
import { SubstitutionApiResponse } from '@/types';

const POLL_INTERVAL_MS = 5 * 60 * 1000;

interface UseSubstitutionPollingOptions {
  userId: string | null;
  entries: TimetableMatchEntry[];
  enabled: boolean;
}

async function hashFingerprint(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function buildMatchKey(match: { substitution: { hours: string; subject: string; teacher: string; type: string } }): string {
  return `${match.substitution.hours}|${match.substitution.subject}|${match.substitution.teacher}|${match.substitution.type}`;
}

async function fetchSubstitutionsForDate(date: Date): Promise<SubstitutionApiResponse | null> {
  try {
    const response = await fetch(`/api/substitutions?date=${formatDateForApi(date)}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as SubstitutionApiResponse;
  } catch {
    return null;
  }
}

export function useSubstitutionPolling({ userId, entries, enabled }: UseSubstitutionPollingOptions) {
  const notifiedFingerprintsRef = useRef(new Set<string>());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!userId || entries.length === 0 || !enabled) {
      return;
    }

    if (document.visibilityState !== 'visible') {
      return;
    }

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dates = [
      { date: today, dateNumber: formatDateForApi(today) },
      { date: tomorrow, dateNumber: formatDateForApi(tomorrow) },
    ];

    for (const { date, dateNumber } of dates) {
      const apiResponse = await fetchSubstitutionsForDate(date);
      if (!apiResponse || apiResponse.type !== 'substitution') {
        continue;
      }

      const substitutions = processApiResponse(apiResponse.rows);
      const matches = findRelevantSubstitutions(substitutions, entries, date);

      if (matches.length === 0) {
        continue;
      }

      const keys = matches.map(buildMatchKey);
      const keysString = `${userId}:${dateNumber}:${keys.sort().join('|')}`;
      const fingerprint = await hashFingerprint(keysString);

      if (notifiedFingerprintsRef.current.has(fingerprint)) {
        continue;
      }

      notifiedFingerprintsRef.current.add(fingerprint);

      const titleDate = date.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });

      const tag = `fds-sub-${dateNumber}-${fingerprint.slice(0, 8)}`;

      new Notification(`FDS Stundenplan · ${titleDate}`, {
        body: `${matches.length} Änderung(en) betreffen deinen Stundenplan.`,
        tag,
      });
    }
  }, [userId, entries, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void poll();

        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => void poll(), POLL_INTERVAL_MS);
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Initial poll + start interval
    void poll();
    intervalRef.current = setInterval(() => void poll(), POLL_INTERVAL_MS);

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, poll]);
}
