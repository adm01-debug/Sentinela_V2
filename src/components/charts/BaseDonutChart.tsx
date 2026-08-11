import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';
import { ChartTooltipContent } from './ChartTooltip';
import { ChartEmptyState } from './ChartEmptyState';
import { PieChart as PieIcon } from 'lucide-react';

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
  valueFormatter?: (value: number | string) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

const DEFAULT_COLORS = [
  'hsl(0, 84%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(262, 83%, 58%)',
  'hsl(330, 81%, 60%)',
];

export function BaseDonutChart({
  data,
  height = 250,
  innerRadius = 60,
  outerRadius = 90,
  showLabel = true,
  colors = DEFAULT_COLORS,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: BaseDonutChartProps) {
  const chartColors = useChartColors();

  if (!data.length) {
    return <ChartEmptyState icon={PieIcon} title={emptyTitle} description={emptyDescription} height={height} />;
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
            showLabel
              ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`
              : false
          }
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
