import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';
import { ChartTooltipContent } from './ChartTooltip';
import { ChartEmptyState } from './ChartEmptyState';
import { TrendingUp } from 'lucide-react';

export interface LineSeriesConfig {
  dataKey: string;
  label: string;
  color?: string;
  strokeWidth?: number;
  dot?: boolean;
  dashed?: boolean;
}

interface BaseLineChartProps {
  data: Record<string, unknown>[];
  series: LineSeriesConfig[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

const DEFAULT_COLORS = [
  'hsl(243, 75%, 59%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(262, 83%, 58%)',
  'hsl(330, 81%, 60%)',
];

export function BaseLineChart({
  data,
  series,
  xAxisKey = 'date',
  height = 300,
  showGrid = true,
  showLegend = false,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: BaseLineChartProps) {
  const colors = useChartColors();

  if (!data.length) {
    return <ChartEmptyState icon={TrendingUp} title={emptyTitle} description={emptyDescription} height={height} />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />}
        <XAxis
          dataKey={xAxisKey}
          stroke={colors.muted}
          tick={{ fill: colors.muted, fontSize: 12 }}
        />
        <YAxis
          stroke={colors.muted}
          tick={{ fill: colors.muted, fontSize: 12 }}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: 16 }} />}
        {series.map((s, i) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.label}
            stroke={s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            strokeWidth={s.strokeWidth ?? 2}
            dot={s.dot ?? false}
            strokeDasharray={s.dashed ? '5 5' : undefined}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
