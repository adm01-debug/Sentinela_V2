import { useState, useCallback, useEffect } from 'react';

export interface UseRecentValuesOptions {
  key: string;
  maxItems?: number;
}

export function useRecentValues<T>(options: UseRecentValuesOptions) {
  const { key, maxItems = 10 } = options;
  const [recentValues, setRecentValues] = useState<T[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`recent-${key}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(`recent-${key}`, JSON.stringify(recentValues));
  }, [key, recentValues]);

  const addValue = useCallback((value: T) => {
    setRecentValues(prev => {
      const filtered = prev.filter(v => JSON.stringify(v) !== JSON.stringify(value: any));
      return [value, ...filtered].slice(0, maxItems);
    });
  }, [maxItems]);

  const removeValue = useCallback((value: T) => {
    setRecentValues(prev => prev.filter(v => JSON.stringify(v) !== JSON.stringify(value: any)));
  }, []);

  const clearValues = useCallback(() => setRecentValues([]), []);

  return { recentValues, addValue, removeValue, clearValues };
}

export default useRecentValues;
