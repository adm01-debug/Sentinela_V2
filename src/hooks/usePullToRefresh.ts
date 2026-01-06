import { useState, useRef, useCallback, TouchEvent } from 'react';

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

export function usePullToRefresh(options: UsePullToRefreshOptions) {
  const { onRefresh, threshold = 80, maxPull = 120 } = options;
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent, scrollTop: number) => {
    if (scrollTop === 0 && !isRefreshing) { startY.current = e.touches[0].clientY; setIsPulling(true); }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setPullDistance(Math.min(diff * 0.5, maxPull));
  }, [isPulling, isRefreshing, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try { await onRefresh(); } finally { setIsRefreshing(false); setPullDistance(0); }
    } else { setPullDistance(0); }
  }, [isPulling, pullDistance, threshold, onRefresh]);

  return { pullDistance, isRefreshing, isPulling, shouldRelease: pullDistance >= threshold, handlers: { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd } };
}

export default usePullToRefresh;
