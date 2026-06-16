import { useState, useMemo, useCallback, useRef } from "react";

export interface UseVirtualScrollOptions<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll<T>(options: UseVirtualScrollOptions<T>) {
  const { items, itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { startIndex, endIndex, virtualItems, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + 2 * overscan);
    const virtualItems = items.slice(startIndex, endIndex).map((item, i) => ({
      item,
      index: startIndex + i,
      style: {
        position: "absolute" as const,
        top: (startIndex + i) * itemHeight,
        height: itemHeight,
        width: "100%",
      },
    }));
    return { startIndex, endIndex, virtualItems, totalHeight };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "auto") => {
      containerRef.current?.scrollTo({ top: index * itemHeight, behavior });
    },
    [itemHeight]
  );

  return {
    containerRef,
    virtualItems,
    totalHeight,
    handleScroll,
    scrollToIndex,
    startIndex,
    endIndex,
  };
}

export default useVirtualScroll;
