import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value: any);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value: any), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}