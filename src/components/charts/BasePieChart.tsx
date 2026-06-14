import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { ChartTooltipContent } from './ChartTooltip';
import { ChartEmptyState } from './ChartEmptyState';
import { useChartColors } from '@/hooks/useChartColors';

interface PieDataItem {
  name: string;
  value: number;
}

interface BasePieChartProps {
  data: PieDataItem[];
  height?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showLegend?: boolean;
  colors?: string[];
  valueFormatter?: (value: any) => string;
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

export function BasePieChart({
  data,
  height = 250,
  outerRadius = 90,
  showLabel = true,
  showLegend = true,
  colors = DEFAULT_COLORS,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: BasePieChartProps) {
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
          outerRadius={outerRadius}
          dataKey="value"
          label={
            showLabel
              ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`
              : false
          }
          labelLine={showLabel}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: 16 }} />}
      </PieChart>
    </ResponsiveContainer>
  );
}
