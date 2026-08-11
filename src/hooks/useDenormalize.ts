import { useMemo } from "react";

export function useDenormalize<T extends { id: string }>(
  ids: string[],
  entities: Record<string, T>
): T[] {
  return useMemo(() => {
    return ids.map(id => entities[id]).filter(Boolean);
  }, [ids, entities]);
}
