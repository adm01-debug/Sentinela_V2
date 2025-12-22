import { useState, useCallback } from 'react';

export function useMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (variables: V) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn]);

  return { mutate, data, error, isLoading };
}
