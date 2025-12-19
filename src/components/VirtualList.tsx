import { useRef, useState, useEffect, useCallback, memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  keyExtractor?: (item: T, index: number) => string;
}

interface VirtualListState {
  scrollTop: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
}

// ============================================================
// VIRTUAL LIST COMPONENT
// ============================================================

function VirtualListInner<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onEndReached,
  endReachedThreshold = 0.8,
  loading = false,
  loadingComponent,
  emptyComponent,
  keyExtractor,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VirtualListState>({
    scrollTop: 0,
    visibleStartIndex: 0,
    visibleEndIndex: Math.ceil(containerHeight / itemHeight) + overscan,
  });

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const calculateVisibleRange = useCallback(
    (scrollTop: number) => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

      return { startIndex, endIndex };
    },
    [itemHeight, containerHeight, items.length, overscan]
  );

  // Handle scroll
  const handleScroll = useCallback(
    (event: Event) => {
      const target = event.target as HTMLDivElement;
      const scrollTop = target.scrollTop;

      const { startIndex, endIndex } = calculateVisibleRange(scrollTop);

      setState({
        scrollTop,
        visibleStartIndex: startIndex,
        visibleEndIndex: endIndex,
      });

      // Check if end reached
      if (onEndReached) {
        const scrollPercentage = (scrollTop + containerHeight) / totalHeight;
        if (scrollPercentage >= endReachedThreshold && !loading) {
          onEndReached();
        }
      }
    },
    [calculateVisibleRange, containerHeight, totalHeight, endReachedThreshold, loading, onEndReached]
  );

  // Setup scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Recalculate on items change
  useEffect(() => {
    const { startIndex, endIndex } = calculateVisibleRange(state.scrollTop);
    setState((prev) => ({
      ...prev,
      visibleStartIndex: startIndex,
      visibleEndIndex: endIndex,
    }));
  }, [items.length, calculateVisibleRange, state.scrollTop]);

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height: containerHeight }}
      >
        {emptyComponent || <p className="text-muted-foreground">No items to display</p>}
      </div>
    );
  }

  // Get visible items
  const visibleItems = items.slice(state.visibleStartIndex, state.visibleEndIndex);

  // Calculate offset for visible items
  const offsetTop = state.visibleStartIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetTop}px)`,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = state.visibleStartIndex + index;
            const key = keyExtractor
              ? keyExtractor(item, actualIndex)
              : String(actualIndex);

            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          {loadingComponent || (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MEMOIZED EXPORT
// ============================================================

export const VirtualList = memo(VirtualListInner) as typeof VirtualListInner;

// ============================================================
// HOOKS
// ============================================================

export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStartIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscan
  );
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const visibleEndIndex = Math.min(
    items.length,
    visibleStartIndex + visibleCount + overscan * 2
  );

  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex);
  const offsetTop = visibleStartIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    offsetTop,
    totalHeight,
    onScroll,
    visibleStartIndex,
    visibleEndIndex,
  };
}

export default VirtualList;
