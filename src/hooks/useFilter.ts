import { useState, useMemo } from 'react';
export function useFilter<T>(items: T[], fn: (i: T, q: string) => boolean) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => query ? items.filter(i => fn(i, query)) : items, [items, query, fn]);
  return { query, setQuery, filtered };
}