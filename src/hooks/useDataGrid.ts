import { useState, useCallback, useMemo } from "react";

interface DataGridState<T> {
  data: T[];
  sortField: keyof T | null;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

export function useDataGrid<T extends Record<string, unknown>>(
  initialData: T[],
  initialPageSize = 10
) {
  const [state, setState] = useState<DataGridState<T>>({
    data: initialData,
    sortField: null,
    sortOrder: "asc",
    page: 0,
    pageSize: initialPageSize,
  });

  const sort = useCallback((field: keyof T) => {
    setState((s) => ({
      ...s,
      sortField: field,
      sortOrder: s.sortField === field && s.sortOrder === "asc" ? "desc" : "asc",
    }));
  }, []);

  const setPage = useCallback((page: number) => setState((s) => ({ ...s, page })), []);

  const sortedData = useMemo(() => {
    if (!state.sortField) return state.data;
    return [...state.data].sort((a, b) => {
      const aVal = a[state.sortField!];
      const bVal = b[state.sortField!];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return state.sortOrder === "asc" ? cmp : -cmp;
    });
  }, [state.data, state.sortField, state.sortOrder]);

  const paginatedData = useMemo(() => {
    const start = state.page * state.pageSize;
    return sortedData.slice(start, start + state.pageSize);
  }, [sortedData, state.page, state.pageSize]);

  return { ...state, sortedData, paginatedData, sort, setPage };
}
