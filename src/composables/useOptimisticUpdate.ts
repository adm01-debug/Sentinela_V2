import { useState, useCallback } from 'react';

export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [previousData, setPreviousData] = useState<T | null>(null);

  const update = useCallback((newData: T | ((prev: T) => T)) => {
    setPreviousData(data);
    setData(prev => typeof newData === 'function' ? (newData as (prev: T) => T)(prev) : newData);
  }, [data]);

  const rollback = useCallback(() => {
    if (previousData !== null) {
      setData(previousData);
      setPreviousData(null);
    }
  }, [previousData]);

  const confirm = useCallback(() => {
    setPreviousData(null);
  }, []);

  return { data, update, rollback, confirm, isPending: previousData !== null };
}
