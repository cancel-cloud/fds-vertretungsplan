import { useState, useEffect, useCallback } from 'react';
import { ProcessedSubstitution, WebUntisResponse } from '@/types';
import { processApiResponse } from '@/lib/data-processing';
import { formatDateForApi } from '@/lib/utils';

interface UseSubstitutionsResult {
  substitutions: ProcessedSubstitution[];
  isLoading: boolean;
  error: string | null;
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

  const fetchSubstitutions = useCallback(async () => {
    const cacheKey = getCacheKey(selectedDate);
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSubstitutions(cached.data);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dateString = formatDateForApi(selectedDate);
      const response = await fetch(`/api/substitutions?date=${dateString}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      const data: WebUntisResponse = await response.json();
      const processed = processApiResponse(data);
      
      // Cache the result
      cache.set(cacheKey, { data: processed, timestamp: Date.now() });
      
      setSubstitutions(processed);
    } catch (err) {
      console.error('Failed to fetch substitutions:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Fehler beim Laden der Vertretungen. Bitte versuchen Sie es später erneut.'
      );
      setSubstitutions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

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
    refetch,
  };
} 
