import * as React from 'react';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerHeight?: number | string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  keyExtractor?: (item: T, index: number) => string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className,
  containerHeight = 400,
  onEndReached,
  endReachedThreshold = 200,
  keyExtractor = (_, i) => String(i),
  emptyComponent,
  loadingComponent,
  isLoading = false,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const getItemHeight = useCallback((index) => {
    return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
  }, [itemHeight]);

  const { totalHeight, itemPositions } = useMemo(() => {
    const positions: number[] = [];
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      positions.push(total);
      total += getItemHeight(i);
    }
    return { totalHeight: total, itemPositions: positions };
  }, [items.length, getItemHeight]);

  const visibleRange = useMemo(() => {
    const height = typeof containerHeight === 'number' ? containerHeight : 400;
    let start = 0;
    let end = items.length;
    
    for (let i = 0; i < items.length; i++) {
      if (itemPositions[i] + getItemHeight(i) >= scrollTop) { start = Math.max(0, i - overscan); break; }
    }
    for (let i = start; i < items.length; i++) {
      if (itemPositions[i] > scrollTop + height) { end = Math.min(items.length, i + overscan); break; }
    }
    return { start, end };
  }, [scrollTop, itemPositions, getItemHeight, containerHeight, overscan, items.length]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
    if (onEndReached && target.scrollHeight - target.scrollTop - target.clientHeight < endReachedThreshold) {
      onEndReached();
    }
  }, [onEndReached, endReachedThreshold]);

  if (items.length === 0 && !isLoading) return <>{emptyComponent}</>;

  return (
    <div ref={containerRef} className={cn('overflow-auto', className)} style={{ height: containerHeight }} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.slice(visibleRange.start, visibleRange.end).map((item, i) => {
          const actualIndex = visibleRange.start + i;
          return (
            <div key={keyExtractor(item, actualIndex)} style={{ position: 'absolute', top: itemPositions[actualIndex], width: '100%', height: getItemHeight(actualIndex) }}>
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
      {isLoading && loadingComponent}
    </div>
  );
}
export default VirtualizedList;
