import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

export interface UseAutoSaveDraftOptions<T> {
  key: string;
  data: T;
  delay?: number;
  onSave?: (data: T) => void;
  onRestore?: (data: T) => void;
}

export function useAutoSaveDraft<T>(options: UseAutoSaveDraftOptions<T>) {
  const { key, data, delay = 2000, onSave, onRestore } = options;
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (initialLoadRef.current) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const { data: draftData, timestamp } = JSON.parse(stored);
          setHasDraft(true);
          setLastSaved(new Date(timestamp));
        } catch (e) { logger.error('Failed to parse draft:', e); }
      }
      initialLoadRef.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const timestamp = Date.now();
      localStorage.setItem(key, JSON.stringify({ data, timestamp }));
      setLastSaved(new Date(timestamp));
      setHasDraft(true);
      onSave?.(data);
    }, delay);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [key, data, delay, onSave]);

  const restoreDraft = useCallback(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const { data: draftData } = JSON.parse(stored);
        onRestore?.(draftData);
        return draftData;
      } catch (e) { logger.error('Failed to restore draft:', e); }
    }
    return null;
  }, [key, onRestore]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setHasDraft(false);
    setLastSaved(null);
  }, [key]);

  const getDraft = useCallback(() => {
    const stored = localStorage.getItem(key);
    if (stored) { try { return JSON.parse(stored).data; } catch { return null; } }
    return null;
  }, [key]);

  return { lastSaved, hasDraft, restoreDraft, clearDraft, getDraft };
}

export default useAutoSaveDraft;
