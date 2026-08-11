import { useState, useCallback, useEffect } from "react";

export function useStorage<T>(key: string, initial: T, type: "local" | "session" = "local") {
  const storage = type === "local" ? localStorage : sessionStorage;
  
  const [value, setValue] = useState<T>(() => {
    const stored = storage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    storage.setItem(key, JSON.stringify(value));
  }, [key, value, storage]);

  const remove = useCallback(() => {
    storage.removeItem(key);
    setValue(initial);
  }, [key, initial, storage]);

  return [value, setValue, remove] as const;
}
