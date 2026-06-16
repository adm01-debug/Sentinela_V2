import { useMemo } from "react";

export function useCompare<T extends Record<string, unknown>>(obj1: T, obj2: T) {
  return useMemo(() => {
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    const changes: { key: string; old: unknown; new: unknown }[] = [];

    keys.forEach((key) => {
      if (obj1[key] !== obj2[key]) {
        changes.push({ key, old: obj1[key], new: obj2[key] });
      }
    });

    return {
      isEqual: changes.length === 0,
      changes,
      changedKeys: changes.map((c) => c.key),
    };
  }, [obj1, obj2]);
}
