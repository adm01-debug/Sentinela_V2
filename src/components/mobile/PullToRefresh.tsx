import { memo, useCallback, useRef, useState, ReactNode } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
  pullText?: string;
  releaseText?: string;
  refreshingText?: string;
}

function PullToRefreshComponent({
  children,
  onRefresh,
  className,
  threshold = 80,
  pullText = 'Puxe para atualizar',
  releaseText = 'Solte para atualizar',
  refreshingText = 'Atualizando...',
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, threshold / 2, threshold], [0, 0.5, 1]);
  const scale = useTransform(y, [0, threshold], [0.8, 1]);
  const rotate = useTransform(y, [0, threshold], [0, 180]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.4;
      const distance = diff * resistance;
      y.set(Math.min(distance, threshold * 1.5));
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [isRefreshing, threshold, y]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      y.set(threshold);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
        setPullDistance(0);
      }
    } else {
      y.set(0);
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh, y]);

  const getStatusText = () => {
    if (isRefreshing) return refreshingText;
    if (pullDistance >= threshold) return releaseText;
    return pullText;
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity, y: useTransform(y, [0, threshold], [-40, 0]) }}
        className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center py-4 z-10"
      >
        <motion.div
          style={{ scale, rotate }}
          className={cn(
            'w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2',
            isRefreshing && 'animate-spin'
          )}
        >
          <RefreshCw className="h-5 w-5 text-primary" />
        </motion.div>
        <span className="text-xs text-muted-foreground">{getStatusText()}</span>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y }} className="relative z-0">
        {children}
      </motion.div>
    </div>
  );
}

export const PullToRefresh = memo(PullToRefreshComponent);
