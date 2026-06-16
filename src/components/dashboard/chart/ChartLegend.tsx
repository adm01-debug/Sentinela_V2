import { memo } from "react";
import { cn } from "@/lib/utils";

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
  value?: number | string;
  active?: boolean;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  onToggle?: (id: string) => void;
  interactive?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function ChartLegendComponent({
  items,
  onToggle,
  interactive = true,
  orientation = "horizontal",
  className,
}: ChartLegendProps) {
  return (
    <div
      className={cn("flex gap-4", orientation === "vertical" ? "flex-col" : "flex-wrap", className)}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => interactive && onToggle?.(item.id)}
          disabled={!interactive}
          className={cn(
            "flex items-center gap-2 text-sm transition-opacity",
            interactive && "cursor-pointer hover:opacity-80",
            item.active === false && "opacity-40"
          )}
        >
          <span
            className="h-3 w-3 flex-shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.label}</span>
          {item.value !== undefined && <span className="font-medium">{item.value}</span>}
        </button>
      ))}
    </div>
  );
}

export const ChartLegend = memo(ChartLegendComponent);
