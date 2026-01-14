import { ReactNode, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const progress = useTransform(y, [0, threshold], [0, 1]);

  const handleDragEnd = useCallback(async () => {
    if (y.get() >= threshold && !isRefreshing && !disabled) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    animate(y, 0, { duration: 0.3 });
  }, [threshold, isRefreshing, disabled, onRefresh, y]);

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: y }}
      >
        {isRefreshing ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <motion.div
            style={{ opacity: progress, scale: progress }}
            className="text-muted-foreground"
          >
            ↓ Puxe para atualizar
          </motion.div>
        )}
      </motion.div>
      <motion.div
        style={{ y }}
        drag={disabled ? false : 'y'}
        dragConstraints={{ top: 0, bottom: threshold }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
