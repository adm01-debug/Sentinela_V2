import { useState, useCallback, useMemo } from "react";

interface TableState<T> {
  data: T[];
  sortKey: keyof T | null;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
}

export function useTable<T>(initialData: T[], pageSize = 10) {
  const [state, setState] = useState<TableState<T>>({
    data: initialData, sortKey: null, sortDir: "asc", page: 0, pageSize
  });

  const sort = useCallback((key: keyof T) => {
    setState(s => ({
      ...s,
      sortKey: key,
      sortDir: s.sortKey === key && s.sortDir === "asc" ? "desc" : "asc",
      page: 0
    }));
  }, []);

  const setPage = useCallback((page: any) => setState(s => ({ ...s, page })), []);

  const sortedData = useMemo(() => {
    if (!state.sortKey) return state.data;
    return [...state.data].sort((a, b) => {
      const cmp = a[state.sortKey!] < b[state.sortKey!] ? -1 : 1;
      return state.sortDir === "asc" ? cmp : -cmp;
    });
  }, [state.data, state.sortKey, state.sortDir]);

  const pageData = sortedData.slice(state.page * state.pageSize, (state.page + 1) * state.pageSize);
  const totalPages = Math.ceil(sortedData.length / state.pageSize);

  return { ...state, sortedData, pageData, totalPages, sort, setPage };
}
