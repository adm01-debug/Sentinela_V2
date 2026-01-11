import { useState, useCallback } from 'react';
import { apiRequest } from '@/services/api';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetch = useCallback(async (endpoint: string) => {
    setLoading(true);
    try {
      const result = await apiRequest<T>(endpoint);
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { data, loading, error, fetch };
}
