import { useState, useEffect, useCallback } from 'react';
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refetch = useCallback(() => { setLoading(true); fetch(url).then(r => r.json()).then(setData).catch(setError).finally(() => setLoading(false)); }, [url]);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}