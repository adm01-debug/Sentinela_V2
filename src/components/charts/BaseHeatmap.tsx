import React from "react";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import { Grid } from "lucide-react";
import { ChartTooltipContent } from "./ChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { useChartColors } from "@/hooks/useChartColors";

interface HeatmapDataItem {
  x: string | number;
  y: string | number;
  value: number;
}

interface BaseHeatmapProps {
  data: HeatmapDataItem[];
  xAxisKey?: string;
  yAxisKey?: string;
  height?: number;
  colorRange?: [string, string];
  emptyTitle?: string;
  emptyDescription?: string;
}

const DEFAULT_COLOR_RANGE: [string, string] = ["#eff6ff", "#1e40af"];

export function BaseHeatmap({
  data,
  xAxisKey = "x",
  yAxisKey = "y",
  height = 400,
  colorRange = DEFAULT_COLOR_RANGE,
  emptyTitle,
  emptyDescription,
}: BaseHeatmapProps) {
  const colors = useChartColors();

  if (!data.length) {
    return (
      <ChartEmptyState
        icon={Grid}
        title={emptyTitle}
        description={emptyDescription}
        height={height}
      />
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <XAxis
          type="category"
          dataKey={xAxisKey}
          name={xAxisKey}
          stroke={colors.muted}
          tick={{ fill: colors.muted, fontSize: 12 }}
          interval={0}
        />
        <YAxis
          type="category"
          dataKey={yAxisKey}
          name={yAxisKey}
          stroke={colors.muted}
          tick={{ fill: colors.muted, fontSize: 12 }}
        />
        <ZAxis type="number" dataKey="value" range={[400, 400]} />
        <Tooltip content={<ChartTooltipContent />} />
        <Scatter data={data} shape="square">
          {data.map((entry, index) => {
            const ratio = maxValue ? entry.value / maxValue : 0;
            // Simple interpolation between colorRange[0] and colorRange[1]
            // In a real project we might use d3-color or similar
            return (
              <Cell key={`cell-${index}`} fill={colorRange[1]} fillOpacity={0.1 + ratio * 0.9} />
            );
          })}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
