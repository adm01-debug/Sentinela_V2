import { useMemo } from 'react';
export function useGroupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return useMemo(() => items.reduce((acc, item) => { const k = String(item[key]); (acc[k] = acc[k] || []).push(item); return acc; }, {} as Record<string, T[]>), [items, key]);
}