import { useCallback } from "react";

export function useDeepMerge<T extends Record<string, unknown>>() {
  const merge = useCallback((target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (typeof target !== "object" || typeof source !== "object") {
      return target;
    }

    for (const key in source) {
      if (source[key] && typeof source[key] === "object") {
        if (!target[key]) Object.assign(target, { [key]: {} });
        merge(target[key] as T, source[key] as Partial<T>);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }

    return merge(target, ...sources);
  }, []);

  return { merge };
}
