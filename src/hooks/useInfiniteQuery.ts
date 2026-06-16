import { useState, useCallback, useRef } from "react";

interface UseInfiniteQueryOptions<T> {
  fetchFn: (page: number) => Promise<T[]>;
  pageSize?: number;
}

export function useInfiniteQuery<T>({ fetchFn, pageSize = 20 }: UseInfiniteQueryOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newData = await fetchFn(pageRef.current);
      setData((prev) => [...prev, ...newData]);
      setHasMore(newData.length >= pageSize);
      pageRef.current++;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, loading, hasMore, pageSize]);

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    pageRef.current = 0;
  }, []);

  return { data, loading, hasMore, loadMore, reset };
}
