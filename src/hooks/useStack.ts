import { useState, useCallback, useMemo } from "react";

export function useStack<T>(initialItems: T[] = []) {
  const [items, setItems] = useState(initialItems);

  const push = useCallback((item) => setItems(prev => [...prev, item]), []);
  const pop = useCallback(() => {
    const popped = items[items.length - 1];
    setItems(prev => prev.slice(0, -1));
    return popped;
  }, [items]);
  const peek = useMemo(() => items[items.length - 1], [items]);
  const clear = useCallback(() => setItems([]), []);

  return { items, push, pop, peek, clear, size: items.length, isEmpty: items.length === 0 };
}
