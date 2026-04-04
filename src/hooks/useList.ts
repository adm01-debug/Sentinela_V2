import { useState, useCallback } from 'react';
export function useList<T>(initial: T[] = []) {
  const [list, setList] = useState(initial);
  const push = useCallback((item: T) => setList(l => [...l, item]), []);
  const removeAt = useCallback((i: number) => setList(l => l.filter((_, idx) => idx !== i)), []);
  const clear = useCallback(() => setList([]), []);
  return { list, push, removeAt, clear, set: setList };
}