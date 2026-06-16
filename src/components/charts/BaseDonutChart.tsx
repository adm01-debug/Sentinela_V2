import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { ChartTooltipContent } from "./ChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { useChartColors } from "@/hooks/useChartColors";

interface DonutDataItem {
  name: string;
  value: number;
}

interface BaseDonutChartProps {
  data: DonutDataItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function BaseDonutChart({
  data,
  height = 250,
  innerRadius = 60,
  outerRadius = 90,
  showLabel = true,
  colors,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: BaseDonutChartProps) {
  const theme = useChartColors();
  // Build the default palette from the active theme so the donut respects
  // light/dark mode and design tokens; an explicit `colors` prop still wins.
  const palette = colors ?? [
    theme.destructive,
    theme.warning,
    theme.primary,
    theme.success,
    theme.accent,
    theme.info,
  ];

  if (!data.length) {
    return (
      <ChartEmptyState
        icon={PieIcon}
        title={emptyTitle}
        description={emptyDescription}
        height={height}
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={
            showLabel ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)` : false
          }
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
