import React, { useState, useRef, useCallback } from "react";
export interface VirtualListProps<T> {
  data: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}
export function VirtualList<T>({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalHeight = data.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    data.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const visibleItems = data.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop),
    []
  );
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={className}
      style={{ height: containerHeight, overflow: "auto" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ position: "absolute", top: offsetY, left: 0, right: 0 }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default VirtualList;
