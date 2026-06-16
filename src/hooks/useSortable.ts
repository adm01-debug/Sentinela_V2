import { useState, useCallback } from "react";

export function useSortable<T>(items: T[]) {
  const [sorted, setSorted] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const onDragStart = useCallback((index) => setDragIndex(index), []);

  const onDragOver = useCallback(
    (index) => {
      if (dragIndex === null || dragIndex === index) return;
      setSorted((prev) => {
        const next = [...prev];
        const [item] = next.splice(dragIndex, 1);
        next.splice(index, 0, item);
        return next;
      });
      setDragIndex(index);
    },
    [dragIndex]
  );

  const onDragEnd = useCallback(() => setDragIndex(null), []);

  return { sorted, onDragStart, onDragOver, onDragEnd };
}
