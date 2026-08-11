import { useState, useCallback } from 'react';

export function useCache<T>() {
  const [cache, setCache] = useState<Map<string, T>>(new Map());
  const get = useCallback((key: string) => cache.get(key), [cache]);
  const set = useCallback((key: string, value: T) => {
    setCache(prev => new Map(prev).set(key, value));
  }, []);
  const remove = useCallback((key: string) => {
    setCache(prev => { const n = new Map(prev); n.delete(key); return n; });
  }, []);
  const clear = useCallback(() => setCache(new Map()), []);
  return { get, set, remove, clear, size: cache.size };
}