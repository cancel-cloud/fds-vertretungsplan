import { useState, useEffect, useCallback } from 'react';
import { 
  ProcessedSubstitution, 
  SubstitutionApiResponse,
  SubstitutionApiMetaResponse 
} from '@/types';
import { processApiResponse } from '@/lib/data-processing';
import { formatDateForApi } from '@/lib/utils';

interface UseSubstitutionsResult {
  substitutions: ProcessedSubstitution[];
  isLoading: boolean;
  error: string | null;
  metaResponse: SubstitutionApiMetaResponse | null;
  refetch: () => void;
}

// Simple in-memory cache for API responses
const cache = new Map<string, { data: ProcessedSubstitution[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (date: Date): string => {
  return formatDateForApi(date); // Preserve local day boundaries
};

export function useSubstitutions(selectedDate: Date): UseSubstitutionsResult {
  const [substitutions, setSubstitutions] = useState<ProcessedSubstitution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaResponse, setMetaResponse] = useState<SubstitutionApiMetaResponse | null>(null);

  const buildErrorMessage = useCallback(async (response: Response) => {
    const defaultMessage = `Request failed with status ${response.status}`;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        if (data && typeof data === 'object') {
          const { error, message } = data as { error?: unknown; message?: unknown };
          const parsedError = typeof error === 'string' ? error.trim() : undefined;
          const parsedMessage = typeof message === 'string' ? message.trim() : undefined;
          if (parsedError) return parsedError;
          if (parsedMessage) return parsedMessage;
        }
      } catch (jsonError) {
        console.warn('Failed to parse JSON error response', jsonError);
        return defaultMessage;
      }
    }

    try {
      const text = await response.text();
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (textError) {
      console.warn('Failed to read error response text', textError);
    }

    return defaultMessage;
  }, []);

  const fetchSubstitutions = useCallback(async () => {
    const cacheKey = getCacheKey(selectedDate);
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSubstitutions(cached.data);
      setIsLoading(false);
      setError(null);
      setMetaResponse(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setMetaResponse(null);

    try {
      const dateString = formatDateForApi(selectedDate);
      const response = await fetch(`/api/substitutions?date=${dateString}`);
      
      if (!response.ok) {
        const message = await buildErrorMessage(response);
        throw new Error(message);
      }
      
      const data: SubstitutionApiResponse = await response.json();

      if (data.type === 'meta') {
        setSubstitutions([]);
        setMetaResponse(data);
      } else {
        const processed = processApiResponse(data.rows);
        
        // Cache only substitution results
        cache.set(cacheKey, { data: processed, timestamp: Date.now() });
        
        setSubstitutions(processed);
        setMetaResponse(null);
      }
    } catch (err) {
      console.error('Failed to fetch substitutions:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Fehler beim Laden der Vertretungen. Bitte versuchen Sie es später erneut.'
      );
      setSubstitutions([]);
      setMetaResponse(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, buildErrorMessage]);

  const refetch = useCallback(() => {
    const cacheKey = getCacheKey(selectedDate);
    cache.delete(cacheKey); // Clear cache for this date
    fetchSubstitutions();
  }, [selectedDate, fetchSubstitutions]);

  useEffect(() => {
    fetchSubstitutions();
  }, [fetchSubstitutions]);

  return {
    substitutions,
    isLoading,
    error,
    metaResponse,
    refetch,
  };
}
