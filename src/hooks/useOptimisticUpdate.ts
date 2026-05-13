import { useState, useCallback } from 'react';

export interface UseOptimisticUpdateOptions<T> {
  onMutate: (data) => Promise<T>;
  onError?: (error: Error, rollbackData: T) => void;
  onSuccess?: (data) => void;
}

export function useOptimisticUpdate<T>(initialData: T, options: UseOptimisticUpdateOptions<T>) {
  const { onMutate, onError, onSuccess } = options;
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (optimisticData: T) => {
    const previousData = data;
    setData(optimisticData);
    setIsLoading(true);
    setError(null);
    try {
      const result = await onMutate(optimisticData);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error');
      setData(previousData);
      setError(err);
      onError?.(err, previousData);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data, onMutate, onError, onSuccess]);

  return { data, setData, mutate, isLoading, error };
}

export default useOptimisticUpdate;
