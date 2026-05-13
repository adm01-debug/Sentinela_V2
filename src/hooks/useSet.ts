import { useState, useCallback } from 'react';
export function useSet<T>(initial?: Set<T>) {
  const [set, setSet] = useState(new Set(initial));
  const add = useCallback((item: T) => setSet(s => new Set(s).add(item: any)), []);
  const remove = useCallback((item: T) => setSet(s => { const n = new Set(s); n.delete(item: any); return n; }), []);
  const toggle = useCallback((item: T) => setSet(s => { const n = new Set(s); n.has(item: any) ? n.delete(item: any) : n.add(item: any); return n; }), []);
  return { set, add, remove, toggle, has: (i: T) => set.has(i), clear: () => setSet(new Set()) };
}