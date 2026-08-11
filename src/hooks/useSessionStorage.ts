import { useState, useCallback } from 'react';
export function useSessionStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => { const stored = sessionStorage.getItem(key); return stored ? JSON.parse(stored) : initial; });
  const set = useCallback((v: T) => { sessionStorage.setItem(key, JSON.stringify(v)); setValue(v); }, [key]);
  const remove = useCallback(() => { sessionStorage.removeItem(key); setValue(initial); }, [key, initial]);
  return { value, set, remove };
}