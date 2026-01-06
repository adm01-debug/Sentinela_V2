import { useState, useEffect, useCallback } from "react";

interface UseOfflineFirstOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  staleTime?: number;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function useOfflineFirst<T>({ key, fetchFn, staleTime = 5 * 60 * 1000 }: UseOfflineFirstOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCached = useCallback((): CachedData<T> | null => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  }, [key]);

  const setCache = useCallback((newData: T) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data: newData, timestamp: Date.now() }));
    } catch {}
  }, [key]);

  const refresh = useCallback(async () => {
    if (!isOnline) return;
    setIsLoading(true);
    try {
      const freshData = await fetchFn();
      setData(freshData);
      setCache(freshData);
      setIsStale(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Fetch failed"));
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, fetchFn, setCache]);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setData(cached.data);
      setIsStale(Date.now() - cached.timestamp > staleTime);
      setIsLoading(false);
    }
    if (isOnline && (!cached || Date.now() - (cached?.timestamp || 0) > staleTime)) {
      refresh();
    } else if (!cached) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); refresh(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, [refresh]);

  return { data, isLoading, isOnline, isStale, error, refresh };
}

export default useOfflineFirst;
