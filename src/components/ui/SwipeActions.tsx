import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface SwipeAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  onClick: () => void;
}

export interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
  disabled = false,
}: SwipeActionsProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentX.current = translateX;
    setIsDragging(true);
  }, [disabled, translateX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    const diff = e.touches[0].clientX - startX.current;
    const newX = currentX.current + diff;
    const maxLeft = leftActions.length * threshold;
    const maxRight = rightActions.length * threshold;
    setTranslateX(Math.max(-maxRight, Math.min(maxLeft, newX)));
  }, [isDragging, disabled, leftActions.length, rightActions.length, threshold]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const maxLeft = leftActions.length * threshold;
    const maxRight = rightActions.length * threshold;
    if (translateX > threshold / 2) setTranslateX(maxLeft);
    else if (translateX < -threshold / 2) setTranslateX(-maxRight);
    else setTranslateX(0);
  }, [translateX, threshold, leftActions.length, rightActions.length]);

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setTranslateX(0);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-y-0 left-0 flex">
        {leftActions.map((action) => (
          <button key={action.id} onClick={() => handleActionClick(action)} className="flex items-center justify-center px-4" style={{ backgroundColor: action.backgroundColor || '#22c55e', color: action.color || 'white', width: threshold }}>
            {action.icon}<span className="ml-1 text-sm">{action.label}</span>
          </button>
        ))}
      </div>
      <div className="absolute inset-y-0 right-0 flex">
        {rightActions.map((action) => (
          <button key={action.id} onClick={() => handleActionClick(action)} className="flex items-center justify-center px-4" style={{ backgroundColor: action.backgroundColor || '#ef4444', color: action.color || 'white', width: threshold }}>
            {action.icon}<span className="ml-1 text-sm">{action.label}</span>
          </button>
        ))}
      </div>
      <div className="relative bg-background" style={{ transform: `translateX(${translateX}px)`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {children}
      </div>
    </div>
  );
}
export default SwipeActions;
