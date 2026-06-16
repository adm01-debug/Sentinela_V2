import { memo } from "react";
import { cn } from "@/lib/utils";

export interface SparklineProps {
  data: number[];
  color?: "primary" | "success" | "warning" | "destructive";
  height?: number;
  showArea?: boolean;
  className?: string;
}

function SparklineComponent({
  data,
  color = "primary",
  height = 40,
  showArea = true,
  className,
}: SparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const padding = 2;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + (1 - (value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
  const colorMap = {
    primary: "stroke-primary fill-primary/20",
    success: "stroke-success fill-success/20",
    warning: "stroke-warning fill-warning/20",
    destructive: "stroke-destructive fill-destructive/20",
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)} style={{ height }}>
      {showArea && <path d={areaPath} className={colorMap[color]} strokeWidth="0" />}
      <path
        d={linePath}
        fill="none"
        className={colorMap[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Sparkline = memo(SparklineComponent);
