import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";

export interface UseOfflineFirstOptions<T> {
  key: string;
  fetchData: () => Promise<T>;
  staleTime?: number;
}

export function useOfflineFirst<T>(options: UseOfflineFirstOptions<T>) {
  const { key, fetchData, staleTime = 5 * 60 * 1000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        setData(cachedData);
        setLastFetched(timestamp);
        return { data: cachedData, timestamp };
      }
    } catch (e) {
      logger.error("Cache read error:", e);
    }
    return null;
  }, [key]);

  const saveToCache = useCallback(
    (newData: T) => {
      try {
        const timestamp = Date.now();
        localStorage.setItem(key, JSON.stringify({ data: newData, timestamp }));
        setLastFetched(timestamp);
      } catch (e) {
        logger.error("Cache write error:", e);
      }
    },
    [key]
  );

  const refresh = useCallback(
    async (force = false) => {
      if (!isOnline && !force) return;
      setIsLoading(true);
      setError(null);
      try {
        const newData = await fetchData();
        setData(newData);
        saveToCache(newData);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Fetch failed"));
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline, fetchData, saveToCache]
  );

  useEffect(() => {
    const cached = loadFromCache();
    if (cached) setIsLoading(false);
    const isStale = !cached || Date.now() - cached.timestamp > staleTime;
    if (isOnline && isStale) refresh();
    else if (!cached) setIsLoading(false);
  }, [loadFromCache, isOnline, staleTime, refresh]);

  return {
    data,
    isLoading,
    isOnline,
    lastFetched,
    error,
    refresh,
    isStale: lastFetched ? Date.now() - lastFetched > staleTime : true,
  };
}

export default useOfflineFirst;
