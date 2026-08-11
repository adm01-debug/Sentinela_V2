import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, ArrowDown } from 'lucide-react';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  maxPull?: number;
  className?: string;
  disabled?: boolean;
  refreshingText?: string;
  pullingText?: string;
  releaseText?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  maxPull = 120,
  className,
  disabled = false,
  refreshingText = 'Refreshing...',
  pullingText = 'Pull to refresh',
  releaseText = 'Release to refresh',
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      const distance = Math.min(diff * 0.5, maxPull);
      setPullDistance(distance);
    }
  }, [isPulling, disabled, isRefreshing, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    setIsPulling(false);
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try { await onRefresh(); } finally { setIsRefreshing(false); setPullDistance(0); }
    } else { setPullDistance(0); }
  }, [isPulling, disabled, pullDistance, threshold, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldRelease = pullDistance >= threshold;

  return (
    <div ref={containerRef} className={cn('relative overflow-auto', className)} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className={cn('absolute left-0 right-0 flex flex-col items-center justify-end transition-transform', pullDistance > 0 || isRefreshing ? 'opacity-100' : 'opacity-0')} style={{ height: Math.max(pullDistance, isRefreshing ? 60 : 0), top: 0 }}>
        {isRefreshing ? (
          <div className="flex items-center gap-2 pb-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="text-sm text-muted-foreground">{refreshingText}</span></div>
        ) : (
          <div className="flex items-center gap-2 pb-2"><ArrowDown className={cn('h-5 w-5 transition-transform', shouldRelease && 'rotate-180')} style={{ opacity: progress }} /><span className="text-sm text-muted-foreground">{shouldRelease ? releaseText : pullingText}</span></div>
        )}
      </div>
      <div style={{ transform: `translateY(${pullDistance}px)`, transition: isPulling ? 'none' : 'transform 0.2s ease-out' }}>{children}</div>
    </div>
  );
}
export default PullToRefresh;
