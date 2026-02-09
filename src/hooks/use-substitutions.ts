import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ProcessedSubstitution,
  SubstitutionApiResponse,
  SubstitutionApiMetaResponse,
} from '@/types';
import { processApiResponse } from '@/lib/data-processing';
import { formatDateForApi } from '@/lib/utils';
import { getDeviceId } from '@/lib/analytics/device-id';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { captureClientEvent } from '@/lib/analytics/posthog-client';

interface UseSubstitutionsResult {
  substitutions: ProcessedSubstitution[];
  isLoading: boolean;
  error: string | null;
  metaResponse: SubstitutionApiMetaResponse | null;
  refetch: () => void;
}

const cache = new Map<string, { data: ProcessedSubstitution[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 50;

const getCacheKey = (date: Date): string => formatDateForApi(date);

const pruneCache = () => {
  if (cache.size <= MAX_CACHE_ENTRIES) {
    return;
  }

  const entries = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  const overflow = cache.size - MAX_CACHE_ENTRIES;

  for (let index = 0; index < overflow; index += 1) {
    cache.delete(entries[index][0]);
  }
};

export function useSubstitutions(selectedDate: Date): UseSubstitutionsResult {
  const [substitutions, setSubstitutions] = useState<ProcessedSubstitution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaResponse, setMetaResponse] = useState<SubstitutionApiMetaResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const buildErrorMessage = useCallback(async (response: Response) => {
    const defaultMessage = `Request failed with status ${response.status}`;

    try {
      const text = await response.text();
      if (!text.trim()) {
        return defaultMessage;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          const data = JSON.parse(text) as { error?: unknown; message?: unknown };
          if (typeof data.error === 'string' && data.error.trim()) {
            return data.error.trim();
          }
          if (typeof data.message === 'string' && data.message.trim()) {
            return data.message.trim();
          }
        } catch {
          return text.trim();
        }
      }

      return text.trim();
    } catch {
      return defaultMessage;
    }
  }, []);

  const fetchSubstitutions = useCallback(async () => {
    const cacheKey = getCacheKey(selectedDate);
    const start = Date.now();

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSubstitutions(cached.data);
      setIsLoading(false);
      setError(null);
      setMetaResponse(null);
      captureClientEvent(ANALYTICS_EVENTS.SUBSTITUTIONS_FETCH_SUCCESS, {
        source: 'cache',
        result_count: cached.data.length,
        duration_ms: Date.now() - start,
      });
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setMetaResponse(null);

    const dateString = formatDateForApi(selectedDate);

    captureClientEvent(ANALYTICS_EVENTS.SUBSTITUTIONS_FETCH_STARTED, {
      date: dateString,
      source: 'network',
    });

    try {
      const deviceId = getDeviceId();
      const response = await fetch(`/api/substitutions?date=${dateString}`, {
        signal: controller.signal,
        headers: deviceId ? { 'x-device-id': deviceId } : undefined,
      });

      if (!response.ok) {
        const message = await buildErrorMessage(response);
        throw new Error(message);
      }

      const data: SubstitutionApiResponse = await response.json();

      if (data.type === 'meta') {
        setSubstitutions([]);
        setMetaResponse(data);
        captureClientEvent(ANALYTICS_EVENTS.SUBSTITUTIONS_FETCH_META, {
          date: data.date,
          duration_ms: Date.now() - start,
        });
        return;
      }

      const processed = processApiResponse(data.rows);
      cache.set(cacheKey, { data: processed, timestamp: Date.now() });
      pruneCache();

      setSubstitutions(processed);
      setMetaResponse(null);

      captureClientEvent(ANALYTICS_EVENTS.SUBSTITUTIONS_FETCH_SUCCESS, {
        source: 'network',
        date: data.date,
        result_count: processed.length,
        duration_ms: Date.now() - start,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('Failed to fetch substitutions:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Fehler beim Laden der Vertretungen. Bitte versuchen Sie es später erneut.';

      setError(message);
      setSubstitutions([]);
      setMetaResponse(null);

      captureClientEvent(ANALYTICS_EVENTS.SUBSTITUTIONS_FETCH_ERROR, {
        date: dateString,
        duration_ms: Date.now() - start,
        message_length: message.length,
      });
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [selectedDate, buildErrorMessage]);

  const refetch = useCallback(() => {
    const cacheKey = getCacheKey(selectedDate);
    cache.delete(cacheKey);
    fetchSubstitutions();
  }, [selectedDate, fetchSubstitutions]);

  useEffect(() => {
    fetchSubstitutions();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchSubstitutions]);

  return {
    substitutions,
    isLoading,
    error,
    metaResponse,
    refetch,
  };
}
