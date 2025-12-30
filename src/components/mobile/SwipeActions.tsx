import { memo, ReactNode, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwipeAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: 'destructive' | 'warning' | 'success' | 'primary' | 'secondary';
  onClick: () => void;
}

export interface SwipeActionsProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
  onSwipeComplete?: (direction: 'left' | 'right', actionId: string) => void;
}

const colorMap = {
  destructive: 'bg-destructive text-destructive-foreground',
  warning: 'bg-warning text-warning-foreground',
  success: 'bg-success text-success-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
};

function SwipeActionsComponent({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
  onSwipeComplete,
}: SwipeActionsProps) {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const leftActionsWidth = leftActions.length * threshold;
  const rightActionsWidth = rightActions.length * threshold;

  // Transform values for actions visibility
  const leftOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightOpacity = useTransform(x, [-threshold, 0], [1, 0]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      // Check if should trigger action
      if (offset > threshold && leftActions.length > 0) {
        const action = leftActions[0];
        action.onClick();
        onSwipeComplete?.('left', action.id);
      } else if (offset < -threshold && rightActions.length > 0) {
        const action = rightActions[0];
        action.onClick();
        onSwipeComplete?.('right', action.id);
      }

      // Snap back
      x.set(0);
    },
    [threshold, leftActions, rightActions, onSwipeComplete, x]
  );

  return (
    <div
      ref={constraintsRef}
      className={cn('relative overflow-hidden touch-pan-y', className)}
    >
      {/* Left Actions (revealed when swiping right) */}
      {leftActions.length > 0 && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute inset-y-0 left-0 flex"
        >
          {leftActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  action.onClick();
                  x.set(0);
                }}
                className={cn(
                  'flex flex-col items-center justify-center px-4 min-w-[80px]',
                  colorMap[action.color]
                )}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {rightActions.length > 0 && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute inset-y-0 right-0 flex"
        >
          {rightActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  action.onClick();
                  x.set(0);
                }}
                className={cn(
                  'flex flex-col items-center justify-center px-4 min-w-[80px]',
                  colorMap[action.color]
                )}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{
          left: -rightActionsWidth,
          right: leftActionsWidth,
        }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          'relative bg-background z-10',
          isDragging && 'cursor-grabbing'
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

export const SwipeActions = memo(SwipeActionsComponent);
