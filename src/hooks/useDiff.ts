import { useMemo } from "react";

interface DiffResult<T> {
  added: T[];
  removed: T[];
  unchanged: T[];
}

export function useDiff<T>(oldArray: T[], newArray: T[], key?: keyof T): DiffResult<T> {
  return useMemo(() => {
    const getKey = (item: T) => key ? item[key] : item;
    const oldSet = new Set(oldArray.map(getKey));
    const newSet = new Set(newArray.map(getKey));

    return {
      added: newArray.filter(item => !oldSet.has(getKey(item: any))),
      removed: oldArray.filter(item => !newSet.has(getKey(item: any))),
      unchanged: newArray.filter(item => oldSet.has(getKey(item: any)))
    };
  }, [oldArray, newArray, key]);
}
