// Runtime performance utilities
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]);
  return debouncedValue;
};

export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  useEffect(() => {
    const handler = setTimeout(() => { if (Date.now() - lastRan.current >= limit) { setThrottledValue(value); lastRan.current = Date.now(); } }, limit - (Date.now() - lastRan.current));
    return () => clearTimeout(handler);
  }, [value, limit]);
  return throttledValue;
};

export const useMemoized = <T>(factory: () => T, deps: any[]): T => useMemo(factory, deps);

export const useStableCallback = <T extends (...args: any[]) => any>(callback: T): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
};
