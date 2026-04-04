import { useEffect, useRef, useState, useCallback } from "react";

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const poll = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;
    
    poll();
    timerRef.current = setInterval(poll, interval);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [poll, interval, enabled]);

  return { data, error, loading, poll };
}
