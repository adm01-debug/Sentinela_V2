import { memo, ReactNode } from "react";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";

export interface StatWithSparklineProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  data: number[];
  icon?: ReactNode;
  className?: string;
}

function StatWithSparklineComponent({
  title,
  value,
  change,
  trend = "neutral",
  data,
  icon,
  className,
}: StatWithSparklineProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-success";
    if (trend === "down") return "text-destructive";
    return "text-muted-foreground";
  };
  const sparklineColor = trend === "up" ? "success" : trend === "down" ? "destructive" : "primary";

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {change !== undefined && (
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            )}
          </div>
        </div>
        {icon && <div className="rounded-lg bg-muted p-2">{icon}</div>}
      </div>
      <div className="mt-3">
        <Sparkline data={data} color={sparklineColor} height={32} />
      </div>
    </div>
  );
}

export const StatWithSparkline = memo(StatWithSparklineComponent);
