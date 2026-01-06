import { useState, useEffect, useCallback, useRef } from "react";

interface SyncItem<T> {
  id: string;
  data: T;
  timestamp: number;
  retries: number;
}

interface UseBackgroundSyncOptions<T> {
  key: string;
  syncFn: (data: T) => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
}

export function useBackgroundSync<T>({ key, syncFn, maxRetries = 3, retryDelay = 5000 }: UseBackgroundSyncOptions<T>) {
  const [pendingItems, setPendingItems] = useState<SyncItem<T>[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  const loadPending = useCallback(() => {
    try {
      const stored = localStorage.getItem(`sync_${key}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }, [key]);

  const savePending = useCallback((items: SyncItem<T>[]) => {
    try { localStorage.setItem(`sync_${key}`, JSON.stringify(items)); } catch {}
  }, [key]);

  const addToQueue = useCallback((data: T) => {
    const item: SyncItem<T> = { id: crypto.randomUUID(), data, timestamp: Date.now(), retries: 0 };
    setPendingItems((prev) => { const next = [...prev, item]; savePending(next); return next; });
  }, [savePending]);

  const processQueue = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setIsSyncing(true);

    const items = loadPending();
    const failed: SyncItem<T>[] = [];

    for (const item of items) {
      try {
        await syncFn(item.data);
      } catch {
        if (item.retries < maxRetries) {
          failed.push({ ...item, retries: item.retries + 1 });
        }
      }
    }

    setPendingItems(failed);
    savePending(failed);
    syncingRef.current = false;
    setIsSyncing(false);
  }, [loadPending, savePending, syncFn, maxRetries]);

  useEffect(() => { setPendingItems(loadPending()); }, [loadPending]);

  useEffect(() => {
    if (navigator.onLine && pendingItems.length > 0) processQueue();
    const handleOnline = () => processQueue();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [pendingItems.length, processQueue]);

  return { addToQueue, pendingCount: pendingItems.length, isSyncing, processQueue };
}

export default useBackgroundSync;
