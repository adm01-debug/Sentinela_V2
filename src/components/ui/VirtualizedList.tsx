import * as React from "react";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  isLoading?: boolean;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  emptyMessage?: string;
  gap?: number;
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className,
  isLoading = false,
  onEndReached,
  endReachedThreshold = 200,
  emptyMessage = "Nenhum item encontrado",
  gap = 0,
}: VirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === "function" ? itemHeight : () => itemHeight,
    overscan,
    gap,
  });

  const virtualItems = virtualizer.getVirtualItems();

  React.useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement || !onEndReached) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      if (scrollHeight - scrollTop - clientHeight < endReachedThreshold) {
        onEndReached();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [onEndReached, endReachedThreshold]);

  if (!isLoading && items.length === 0) {
    return <div className="flex items-center justify-center h-32 text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div ref={parentRef} className={cn("overflow-auto", className)} style={{ height }}>
      <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: virtualRow.size,
              transform: \`translateY(\${virtualRow.start}px)\`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export default VirtualizedList;
