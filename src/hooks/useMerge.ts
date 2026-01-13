import { useCallback } from "react";

export function useMerge<T extends object>() {
  const merge = useCallback((...objects: Partial<T>[]): T => {
    return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T);
  }, []);

  return { merge };
}
