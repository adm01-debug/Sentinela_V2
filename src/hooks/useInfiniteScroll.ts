import { useState, useCallback, useEffect, useRef } from 'react';
export function useInfiniteScroll(loadMore: () => void, hasMore: boolean) {
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver>();
  const lastRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => { if (entries[0].isIntersecting && hasMore) { setLoading(true); loadMore(); setLoading(false); } });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);
  return { lastRef, loading };
}