import { useState, useCallback, useRef } from 'react';

interface UseInfiniteQueryOptions<T> {
  queryFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  initialPage?: number;
}

export function useInfiniteQuery<T>({ queryFn, initialPage = 1 }: UseInfiniteQueryOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(initialPage);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const result = await queryFn(pageRef.current);
      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      pageRef.current++;
    } finally {
      setLoading(false);
    }
  }, [queryFn, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    pageRef.current = initialPage;
  }, [initialPage]);

  return { data, loading, hasMore, fetchMore, reset };
}
