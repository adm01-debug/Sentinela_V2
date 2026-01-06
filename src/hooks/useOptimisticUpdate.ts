import { useState, useCallback } from "react";

interface UseOptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<T>;
  onError?: (error: Error, previousData: T) => void;
}

export function useOptimisticUpdate<T>(initialData: T, options: UseOptimisticUpdateOptions<T>) {
  const { onUpdate, onError } = options;
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (optimisticData: T) => {
    const previousData = data;
    setData(optimisticData);
    setIsUpdating(true);
    setError(null);

    try {
      const result = await onUpdate(optimisticData);
      setData(result);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Update failed");
      setError(err);
      setData(previousData);
      onError?.(err, previousData);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [data, onUpdate, onError]);

  const reset = useCallback((newData?: T) => {
    setData(newData ?? initialData);
    setError(null);
  }, [initialData]);

  return { data, isUpdating, error, update, reset, setData };
}

export default useOptimisticUpdate;
