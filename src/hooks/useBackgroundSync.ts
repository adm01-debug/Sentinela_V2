import { useState, useEffect, useCallback, useRef } from 'react';

export interface SyncItem<T> { id: string; data: T; timestamp: number; retries: number; }

export interface UseBackgroundSyncOptions<T> {
  storageKey: string;
  syncFn: (item) => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
}

export function useBackgroundSync<T>(options: UseBackgroundSyncOptions<T>) {
  const { storageKey, syncFn, maxRetries = 3, retryDelay = 5000 } = options;
  const [queue, setQueue] = useState<SyncItem<T>[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const syncingRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setQueue(JSON.parse(stored));
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [storageKey]);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(queue)); }, [queue, storageKey]);

  const addToQueue = useCallback((data) => {
    const item: SyncItem<T> = { id: crypto.randomUUID(), data, timestamp: Date.now(), retries: 0 };
    setQueue(prev => [...prev, item]);
    return item.id;
  }, []);

  const processQueue = useCallback(async () => {
    if (syncingRef.current || !isOnline || queue.length === 0) return;
    syncingRef.current = true;
    setIsSyncing(true);
    const item = queue[0];
    try {
      await syncFn(item.data);
      setQueue(prev => prev.filter(i => i.id !== item.id));
    } catch (e) {
      if (item.retries < maxRetries) {
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, retries: i.retries + 1 } : i));
        setTimeout(processQueue, retryDelay);
      } else {
        setQueue(prev => prev.filter(i => i.id !== item.id));
      }
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [isOnline, queue, syncFn, maxRetries, retryDelay]);

  useEffect(() => { if (isOnline && queue.length > 0) processQueue(); }, [isOnline, queue.length, processQueue]);

  return { queue, addToQueue, isSyncing, isOnline, pendingCount: queue.length, clearQueue: () => setQueue([]) };
}

export default useBackgroundSync;
