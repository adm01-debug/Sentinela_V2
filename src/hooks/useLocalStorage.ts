import { useState } from "react";
export const useLocalStorage = <T>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = (v: T) => {
    localStorage.setItem(key, JSON.stringify(v));
    setValue(v);
  };
  return [value, set] as const;
};
