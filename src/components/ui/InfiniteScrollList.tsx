import * as React from "react";
import { useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  className?: string;
  keyExtractor?: (item: T, index: number) => string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
}

export function InfiniteScrollList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 200,
  className,
  keyExtractor = (_, i) => String(i),
  emptyComponent = <p className="py-8 text-center text-muted-foreground">No items found</p>,
  loadingComponent = (
    <div className="flex justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
  endComponent = <p className="py-4 text-center text-sm text-muted-foreground">No more items</p>,
}: InfiniteScrollListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore || loadingRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadingRef.current = true;
      onLoadMore();
    }
  }, [loading, hasMore, threshold, onLoadMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  if (items.length === 0 && !loading) return <>{emptyComponent}</>;

  return (
    <div ref={containerRef} className={cn("overflow-auto", className)}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)}>{renderItem(item, index)}</div>
      ))}
      {loading && loadingComponent}
      {!hasMore && items.length > 0 && endComponent}
    </div>
  );
}
export default InfiniteScrollList;
