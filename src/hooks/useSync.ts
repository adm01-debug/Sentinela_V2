import { useState, useCallback, useEffect } from "react";

export function useSync<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  const sync = useCallback(
    (newValue: T) => {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    [key]
  );

  return [value, sync] as const;
}
