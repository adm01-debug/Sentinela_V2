import { useCallback } from "react";

export function useClone<T>() {
  const clone = useCallback((obj: T): T => {
    if (obj === null || typeof obj !== "object") return obj;
    return JSON.parse(JSON.stringify(obj));
  }, []);

  const deepClone = useCallback((obj: T): T => {
    return structuredClone(obj);
  }, []);

  return { clone, deepClone };
}
