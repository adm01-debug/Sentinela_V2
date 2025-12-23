import React, { ComponentType, useState } from 'react';
interface SortState<T> { sortKey: keyof T | null; sortOrder: 'asc' | 'desc'; setSort: (key: keyof T) => void; }
export function withSort<P extends object, T>(Component: ComponentType<P & SortState<T>>) {
  return function WithSortComponent(props: P) {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const setSort = (key: keyof T) => { if (sortKey === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortOrder('asc'); } };
    return <Component {...props} sortKey={sortKey} sortOrder={sortOrder} setSort={setSort} />;
  };
}
