import { useState, useMemo, useCallback } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export interface UsePaginationReturn<T> {
  // Estado
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  
  // Dados paginados
  paginatedData: T[];
  
  // Navegação
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  
  // Info
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Para queries
  offset: number;
  limit: number;
}

/**
 * Hook para paginação client-side
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 10,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ajustar página se necessário
  const safePage = useMemo(() => {
    if (page > totalPages && totalPages > 0) return totalPages;
    if (page < 1) return 1;
    return page;
  }, [page, totalPages]);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (safePage < totalPages) setPage(safePage + 1);
  }, [safePage, totalPages]);

  const prevPage = useCallback(() => {
    if (safePage > 1) setPage(safePage - 1);
  }, [safePage]);

  const firstPage = useCallback(() => setPage(1), []);
  const lastPage = useCallback(() => setPage(totalPages), [totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset para primeira página
  }, []);

  return {
    page: safePage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    startIndex: startIndex + 1,
    endIndex,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    offset: startIndex,
    limit: pageSize,
  };
}

/**
 * Hook para paginação server-side (com React Query)
 */
export function useServerPagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems = 0,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [total, setTotal] = useState(totalItems);

  const totalPages = Math.ceil(total / pageSize);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages || 1)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) setPage(page + 1);
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const setTotalItems = useCallback((count: number) => {
    setTotal(count);
  }, []);

  return {
    page,
    pageSize,
    totalPages,
    totalItems: total,
    goToPage,
    nextPage,
    prevPage,
    firstPage: () => setPage(1),
    lastPage: () => setPage(totalPages),
    setPageSize,
    setTotalItems,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    offset: (page - 1) * pageSize,
    limit: pageSize,
    // Range para Supabase
    rangeStart: (page - 1) * pageSize,
    rangeEnd: page * pageSize - 1,
  };
}
