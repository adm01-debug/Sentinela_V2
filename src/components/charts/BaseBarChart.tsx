import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';
import { ChartTooltipContent } from './ChartTooltip';
import { ChartEmptyState } from './ChartEmptyState';
import { BarChart3 } from 'lucide-react';

export interface BarSeriesConfig {
  dataKey: string;
  label: string;
  color?: string;
  radius?: [number, number, number, number];
  stack?: string;
}

interface BaseBarChartProps {
  data: unknown[];
  series: BarSeriesConfig[];
  xAxisKey?: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  showLegend?: boolean;
  colorByIndex?: boolean;
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

export function BaseBarChart({
  data,
  series,
  xAxisKey = 'name',
  height = 250,
  layout = 'horizontal',
  showGrid = true,
  showLegend = false,
  colorByIndex = false,
  colors = DEFAULT_COLORS,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: BaseBarChartProps) {
  const chartColors = useChartColors();

  if (!data.length) {
    return <ChartEmptyState icon={BarChart3} title={emptyTitle} description={emptyDescription} height={height} />;
  }

  const isVertical = layout === 'vertical';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isVertical ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 30, left: isVertical ? 100 : -20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />}
        {isVertical ? (
          <>
            <XAxis type="number" stroke={chartColors.muted} />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              stroke={chartColors.muted}
              tick={{ fill: chartColors.muted, fontSize: 12 }}
              width={95}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xAxisKey} stroke={chartColors.muted} tick={{ fill: chartColors.muted, fontSize: 12 }} />
            <YAxis stroke={chartColors.muted} tick={{ fill: chartColors.muted, fontSize: 12 }} allowDecimals={false} />
          </>
        )}
        <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: 16 }} />}
        {series.map((s, si) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.label}
            fill={s.color || colors[si % colors.length]}
            radius={s.radius ?? (isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0])}
            stackId={s.stack}
          >
            {colorByIndex &&
              data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
              ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
