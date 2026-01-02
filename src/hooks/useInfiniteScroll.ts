// ============================================================
// INFINITE SCROLL HOOK
// Paginação infinita com React Query e Intersection Observer
// ============================================================

import { useRef, useEffect, useCallback } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { supabase, isSupabaseReady } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

export interface InfiniteScrollConfig {
  table: string;
  select?: string;
  pageSize?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, unknown>;
  enabled?: boolean;
}

export interface PageData<T> {
  data: T[];
  nextPage: number | null;
  totalCount: number;
}

export interface UseInfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  totalCount: number;
  loadedCount: number;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  error: Error | null;
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useInfiniteScroll<T = Record<string, unknown>>(
  config: InfiniteScrollConfig
): UseInfiniteScrollResult<T> {
  const {
    table,
    select = '*',
    pageSize = 20,
    orderBy = { column: 'created_at', ascending: false },
    filters = {},
    enabled = true,
  } = config;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // QUERY KEY
  // ============================================================

  const queryKey = [
    'infinite',
    table,
    select,
    pageSize,
    orderBy.column,
    orderBy.ascending,
    JSON.stringify(filters),
  ];

  // ============================================================
  // FETCH FUNCTION
  // ============================================================

  const fetchPage = async ({ pageParam = 0 }): Promise<PageData<T>> => {
    if (!isSupabaseReady) {
      console.log('[InfiniteScroll] Supabase não configurado');
      return { data: [], nextPage: null, totalCount: 0 };
    }

    const from = pageParam * pageSize;
    const to = from + pageSize - 1;

    // Build query
    let query = supabase
      .from(table)
      .select(select, { count: 'exact' })
      .range(from, to)
      .order(orderBy.column, { ascending: orderBy.ascending ?? false });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error, count } = await query;

    if (error) {
      console.error('[InfiniteScroll] Error:', error);
      throw error;
    }

    const hasMore = (data?.length ?? 0) === pageSize;

    return {
      data: (data ?? []) as T[],
      nextPage: hasMore ? pageParam + 1 : null,
      totalCount: count ?? 0,
    };
  };

  // ============================================================
  // INFINITE QUERY
  // ============================================================

  const {
    data: queryData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled,
    staleTime: 30 * 1000, // 30 segundos
  });

  // ============================================================
  // FLATTEN DATA
  // ============================================================

  const flatData = queryData?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = queryData?.pages[0]?.totalCount ?? 0;

  // ============================================================
  // INTERSECTION OBSERVER
  // ============================================================

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    data: flatData,
    isLoading,
    isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    fetchNextPage,
    refetch,
    totalCount,
    loadedCount: flatData.length,
    loadMoreRef,
    error: error as Error | null,
  };
}

// ============================================================
// VIRTUALIZED VERSION (for large lists)
// ============================================================

export function useVirtualizedInfiniteScroll<T>(
  config: InfiniteScrollConfig & { estimatedItemHeight?: number }
) {
  const result = useInfiniteScroll<T>(config);

  // Adiciona métricas para virtualização
  const estimatedTotalHeight = result.totalCount * (config.estimatedItemHeight ?? 50);
  const loadedHeight = result.loadedCount * (config.estimatedItemHeight ?? 50);

  return {
    ...result,
    estimatedTotalHeight,
    loadedHeight,
    loadProgress: result.totalCount > 0 ? result.loadedCount / result.totalCount : 0,
  };
}

// ============================================================
// MANUAL LOAD MORE BUTTON HOOK
// ============================================================

export function useLoadMore<T>(config: InfiniteScrollConfig) {
  const result = useInfiniteScroll<T>(config);

  // Remove intersection observer behavior
  // User must click button to load more

  return {
    ...result,
    // Não inclui loadMoreRef
    loadMore: result.fetchNextPage,
  };
}

export default useInfiniteScroll;
