import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAutoSaveDraftOptions<T> {
  key: string;
  data: T;
  debounceMs?: number;
  onSave?: (data: T) => void;
  onRestore?: (data: T) => void;
}

export function useAutoSaveDraft<T>(options: UseAutoSaveDraftOptions<T>) {
  const { key, data, debounceMs = 1000, onSave, onRestore } = options;
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const { data: draft, timestamp } = JSON.parse(stored);
          setHasDraft(true);
          setLastSaved(new Date(timestamp));
        } catch (e) {}
      }
      initialLoad.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const payload = { data, timestamp: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(payload));
      setHasDraft(true);
      setLastSaved(new Date());
      onSave?.(data);
    }, debounceMs);

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [key, data, debounceMs, onSave]);

  const restoreDraft = useCallback((): T | null => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const { data: draft } = JSON.parse(stored);
        onRestore?.(draft);
        return draft;
      } catch (e) {}
    }
    return null;
  }, [key, onRestore]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setHasDraft(false);
    setLastSaved(null);
  }, [key]);

  return { hasDraft, lastSaved, restoreDraft, clearDraft };
}

export default useAutoSaveDraft;
