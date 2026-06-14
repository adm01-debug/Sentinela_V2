import { useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useQueryClient() {
  const cache = useRef<Map<string, CacheEntry<unknown>>>(new Map());

  const get = useCallback(<T>(key: string): T | undefined => {
    const entry = cache.current.get(key);
    return entry?.data as T;
  }, []);

  const set = useCallback(<T>(key: string, data: T) => {
    cache.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const invalidate = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    cache.current.clear();
  }, []);

  return { get, set, invalidate, clear };
}
