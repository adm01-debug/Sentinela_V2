import { useState, useCallback, useEffect } from "react";

export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  const [synced, setSynced] = useState(true);

  const save = useCallback((newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
    setSynced(false);
  }, [key]);

  const sync = useCallback(async () => {
    setSynced(true);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (navigator.onLine && !synced) sync();
    };
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [synced, sync]);

  return { value, save, synced, sync };
}
