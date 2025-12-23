import React, { ComponentType, useState, useCallback } from 'react';
interface FilterState<T> { filters: Partial<T>; setFilter: (key: keyof T, value: any) => void; clearFilters: () => void; }
export function withFilter<P extends object, T>(Component: ComponentType<P & FilterState<T>>, initialFilters: Partial<T> = {}) {
  return function WithFilterComponent(props: P) {
    const [filters, setFilters] = useState<Partial<T>>(initialFilters);
    const setFilter = useCallback((key: keyof T, value: any) => setFilters(f => ({ ...f, [key]: value })), []);
    const clearFilters = useCallback(() => setFilters(initialFilters), []);
    return <Component {...props} filters={filters} setFilter={setFilter} clearFilters={clearFilters} />;
  };
}
