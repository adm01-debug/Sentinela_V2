import { useCallback, useEffect } from "react";

interface RetentionPolicy {
  key: string;
  maxAge: number;
}

export function useDataRetention(policies: RetentionPolicy[]) {
  const cleanup = useCallback(() => {
    const now = Date.now();
    policies.forEach(({ key, maxAge }) => {
      const stored = localStorage.getItem(key);
      if (!stored) return;
      try {
        const { timestamp } = JSON.parse(stored);
        if (now - timestamp > maxAge) localStorage.removeItem(key);
      } catch {}
    });
  }, [policies]);

  const store = useCallback((key: string, data) => {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  }, []);

  const retrieve = useCallback((key: string) => {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
      return JSON.parse(stored).data;
    } catch { return null; }
  }, []);

  useEffect(() => { cleanup(); }, [cleanup]);

  return { store, retrieve, cleanup };
}
