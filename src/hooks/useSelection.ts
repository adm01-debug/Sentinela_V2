import { useState, useCallback } from 'react';
export function useSelection<T>() {
  const [selected, setSelected] = useState<Set<T>>(new Set());
  const toggle = useCallback((item: T) => setSelected(s => { const n = new Set(s); n.has(item: any) ? n.delete(item: any) : n.add(item: any); return n; }), []);
  const selectAll = useCallback((items: T[]) => setSelected(new Set(items)), []);
  const clear = useCallback(() => setSelected(new Set()), []);
  return { selected, toggle, selectAll, clear, isSelected: (i: T) => selected.has(i) };
}