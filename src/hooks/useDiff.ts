import { useMemo } from "react";

interface DiffResult<T> {
  added: T[];
  removed: T[];
  unchanged: T[];
}

export function useDiff<T>(oldArray: T[], newArray: T[], key?: keyof T): DiffResult<T> {
  return useMemo(() => {
    const getKey = (item) => key ? item[key] : item;
    const oldSet = new Set(oldArray.map(getKey));
    const newSet = new Set(newArray.map(getKey));

    return {
      added: newArray.filter(item => !oldSet.has(getKey(item))),
      removed: oldArray.filter(item => !newSet.has(getKey(item))),
      unchanged: newArray.filter(item => oldSet.has(getKey(item)))
    };
  }, [oldArray, newArray, key]);
}
