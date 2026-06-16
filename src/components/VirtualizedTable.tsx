import { memo, useCallback, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { VirtualList } from "@/components/VirtualList";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

export interface Column<T> {
  key: string;
  header: string | ReactNode;
  width?: string;
  render: (item: T, index: number) => ReactNode;
  className?: string;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  containerHeight?: number;
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
}

// ============================================================
// VIRTUALIZED TABLE COMPONENT
// ============================================================

function VirtualizedTableInner<T>({
  data,
  columns,
  rowHeight = 56,
  containerHeight = 500,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage,
  className,
  headerClassName,
  rowClassName,
}: VirtualizedTableProps<T>) {
  const { t } = useTranslation();

  const renderRow = useCallback(
    (item: T, index: number) => {
      const rowClass =
        typeof rowClassName === "function" ? rowClassName(item, index) : rowClassName;

      return (
        <div
          className={cn(
            "flex items-center border-b border-border transition-colors hover:bg-muted/50",
            onRowClick && "cursor-pointer",
            rowClass
          )}
          role={onRowClick ? "button" : undefined}
          tabIndex={onRowClick ? 0 : undefined}
          onClick={() => onRowClick?.(item, index)}
          onKeyDown={
            onRowClick
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick(item, index);
                  }
                }
              : undefined
          }
          style={{ height: rowHeight }}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn("flex items-center px-4 py-2", column.className)}
              style={{ width: column.width || "auto", flex: column.width ? "none" : 1 }}
            >
              {column.render(item, index)}
            </div>
          ))}
        </div>
      );
    },
    [columns, rowHeight, onRowClick, rowClassName]
  );

  const emptyComponent = (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <p>{emptyMessage || t("common.noData")}</p>
    </div>
  );

  const loadingComponent = (
    <div className="flex items-center justify-center py-4">
      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );

  return (
    <div className={cn("rounded-md border", className)}>
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-b border-border bg-muted/50 text-sm font-medium",
          headerClassName
        )}
        style={{ height: rowHeight }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn("px-4 py-2", column.className)}
            style={{ width: column.width || "auto", flex: column.width ? "none" : 1 }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <VirtualList
        items={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        loading={loading}
        loadingComponent={loadingComponent}
        emptyComponent={emptyComponent}
        overscan={5}
      />
    </div>
  );
}

// ============================================================
// MEMOIZED EXPORT
// ============================================================

export const VirtualizedTable = memo(VirtualizedTableInner) as typeof VirtualizedTableInner;

export default VirtualizedTable;
