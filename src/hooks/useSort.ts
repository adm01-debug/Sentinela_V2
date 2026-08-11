import { useState, useMemo, useCallback } from 'react';
export function useSort<T>(items: T[], defaultKey?: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const sorted = useMemo(() => { if (!sortKey) return items; return [...items].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1); }); }, [items, sortKey, sortDir]);
  const toggleSort = useCallback((key: keyof T) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc'); } }, [sortKey]);
  return { sorted, sortKey, sortDir, toggleSort };
}