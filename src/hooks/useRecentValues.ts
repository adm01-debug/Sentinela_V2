import { useState, useEffect, useCallback } from 'react';

export interface RecentValue<T> {
  value: T;
  timestamp: Date;
  count: number;
}

export interface UseRecentValuesOptions<T> {
  key: string;
  maxItems?: number;
  serialize?: (value: T) => string;
  deserialize?: (str: string) => T;
}

export function useRecentValues<T>(options: UseRecentValuesOptions<T>) {
  const { key, maxItems = 10, serialize = JSON.stringify, deserialize = JSON.parse } = options;
  const [recentValues, setRecentValues] = useState<RecentValue<T>[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentValues(parsed.map((item: any) => ({ ...item, value: deserialize(item.value), timestamp: new Date(item.timestamp) })));
      } catch (e) {}
    }
  }, [key, deserialize]);

  useEffect(() => {
    const toStore = recentValues.map(item => ({ ...item, value: serialize(item.value), timestamp: item.timestamp.toISOString() }));
    localStorage.setItem(key, JSON.stringify(toStore));
  }, [recentValues, key, serialize]);

  const addValue = useCallback((value: T) => {
    setRecentValues(prev => {
      const serialized = serialize(value);
      const existingIndex = prev.findIndex(item => serialize(item.value) === serialized);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], timestamp: new Date(), count: updated[existingIndex].count + 1 };
        return updated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      }
      return [{ value, timestamp: new Date(), count: 1 }, ...prev].slice(0, maxItems);
    });
  }, [serialize, maxItems]);

  const removeValue = useCallback((value: T) => {
    const serialized = serialize(value);
    setRecentValues(prev => prev.filter(item => serialize(item.value) !== serialized));
  }, [serialize]);

  const clear = useCallback(() => {
    setRecentValues([]);
    localStorage.removeItem(key);
  }, [key]);

  const getMostUsed = useCallback((limit = 5) => [...recentValues].sort((a, b) => b.count - a.count).slice(0, limit), [recentValues]);

  return { recentValues, addValue, removeValue, clear, getMostUsed };
}

export default useRecentValues;
