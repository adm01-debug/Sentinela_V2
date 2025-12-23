import { useState, useCallback } from 'react';
import { api } from '@/api/client';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const get = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<T>(url);
      setData(res.data);
      return res.data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async (url: string, body: any) => {
    setLoading(true);
    try {
      const res = await api.post<T>(url, body);
      setData(res.data);
      return res.data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, get, post };
}
