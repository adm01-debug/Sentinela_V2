import { useState, useMemo, useCallback } from 'react';
export function useSearch<T>(items: T[], searchKeys: (keyof T)[]) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => { if (!query) return items; const q = query.toLowerCase(); return items.filter(item => searchKeys.some(k => String(item[k]).toLowerCase().includes(q))); }, [items, query, searchKeys]);
  return { query, setQuery, results, clear: useCallback(() => setQuery(''), []) };
}