import { useMemo } from "react";

export function useNormalize<T extends { id: string }>(
  items: T[]
): { ids: string[]; entities: Record<string, T> } {
  return useMemo(() => {
    const ids: string[] = [];
    const entities: Record<string, T> = {};

    items.forEach((item) => {
      ids.push(item.id);
      entities[item.id] = item;
    });

    return { ids, entities };
  }, [items]);
}
