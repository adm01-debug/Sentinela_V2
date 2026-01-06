import { useState, useRef, useCallback, TouchEvent } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80, maxPull = 120 }: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (isRefreshing) return;
    const scrollTop = (e.currentTarget as HTMLElement).scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [isRefreshing]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const diff = Math.min(e.touches[0].clientY - startY.current, maxPull);
    if (diff > 0) setPullDistance(diff);
  }, [isRefreshing, maxPull]);

  const onTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      try { await onRefresh(); } finally { setIsRefreshing(false); setPullDistance(0); }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, onRefresh]);

  const isReady = pullDistance >= threshold && !isRefreshing;

  return { pullDistance, isRefreshing, isReady, handlers: { onTouchStart, onTouchMove, onTouchEnd } };
}

export default usePullToRefresh;
