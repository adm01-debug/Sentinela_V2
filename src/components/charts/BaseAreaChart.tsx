import {
  AreaChart,
  Area,
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
import { Activity } from 'lucide-react';

export interface AreaSeriesConfig {
  dataKey: string;
  label: string;
  color?: string;
  gradientOpacity?: [number, number];
  strokeWidth?: number;
}

interface BaseAreaChartProps {
  data: unknown[];
  series: AreaSeriesConfig[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: any) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

const DEFAULT_COLORS = [
  'hsl(243, 75%, 59%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(262, 83%, 58%)',
];

export function BaseAreaChart({
  data,
  series,
  xAxisKey = 'date',
  height = 300,
  showGrid = true,
  showLegend = false,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: BaseAreaChartProps) {
  const colors = useChartColors();

  if (!data.length) {
    return <ChartEmptyState icon={Activity} title={emptyTitle} description={emptyDescription} height={height} />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            const [startOp, endOp] = s.gradientOpacity ?? [0.3, 0];
            return (
              <linearGradient key={s.dataKey} id={`grad-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={startOp} />
                <stop offset="95%" stopColor={color} stopOpacity={endOp} />
              </linearGradient>
            );
          })}
        </defs>
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
        {series.map((s, i) => {
          const color = s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label}
              stroke={color}
              strokeWidth={s.strokeWidth ?? 2}
              fillOpacity={1}
              fill={`url(#grad-${s.dataKey})`}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}
