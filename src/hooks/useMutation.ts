import { useState, useCallback } from 'react';

export function useMutation<T, V>(mutationFn: (vars: V) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (vars: V) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(vars);
      setData(result);
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, data, error, loading, reset: () => { setData(null); setError(null); } };
}