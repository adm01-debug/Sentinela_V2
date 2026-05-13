import { useState, useCallback } from "react";

export function useMultiSelect<T>(items: T[], keyFn: (item) => string) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((item) => {
    const key = keyFn(item);
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, [keyFn]);

  const selectAll = useCallback(() => {
    setSelected(new Set(items.map(keyFn)));
  }, [items, keyFn]);

  const deselectAll = useCallback(() => setSelected(new Set()), []);

  const isSelected = useCallback((item) => selected.has(keyFn(item)), [selected, keyFn]);

  const selectedItems = items.filter(i => selected.has(keyFn(i)));

  return { selected, selectedItems, toggle, selectAll, deselectAll, isSelected };
}
