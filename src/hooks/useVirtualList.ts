import { useState, useMemo } from 'react';
export function useVirtualList<T>(items: T[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 1;
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  const visibleItems = useMemo(() => items.slice(startIndex, endIndex).map((item, i) => ({ item, index: startIndex + i, style: { position: 'absolute' as const, top: (startIndex + i) * itemHeight, height: itemHeight } })), [items, startIndex, endIndex, itemHeight]);
  return { visibleItems, totalHeight: items.length * itemHeight, onScroll: (e: React.UIEvent<HTMLElement>) => setScrollTop(e.currentTarget.scrollTop) };
}