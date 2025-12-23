import { useState, useMemo } from 'react';

interface UseTableOptions<T> {
  data: T[];
  pageSize?: number;
  initialSort?: { key: keyof T; order: 'asc' | 'desc' };
}

export function useTable<T>({ data, pageSize = 10, initialSort }: UseTableOptions<T>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filteredData = useMemo(() => {
    let result = [...data];
    Object.entries(filters).forEach(([key, value]) => {
      if (value) result = result.filter(item => String((item as any)[key]).toLowerCase().includes(String(value).toLowerCase()));
    });
    if (sort) {
      result.sort((a, b) => {
        const aVal = (a as any)[sort.key];
        const bVal = (b as any)[sort.key];
        return sort.order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
    }
    return result;
  }, [data, filters, sort]);

  const paginatedData = useMemo(() => filteredData.slice((page - 1) * pageSize, page * pageSize), [filteredData, page, pageSize]);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return { data: paginatedData, page, setPage, sort, setSort, filters, setFilters, totalPages, total: filteredData.length };
}
