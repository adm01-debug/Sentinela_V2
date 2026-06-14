import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { Target } from 'lucide-react';
import { ChartTooltipContent } from './ChartTooltip';
import { ChartEmptyState } from './ChartEmptyState';
import { useChartColors } from '@/hooks/useChartColors';

export interface ScatterSeriesConfig {
  dataKey: string;
  name: string;
  color?: string;
}

interface BaseScatterChartProps {
  data: any[];
  series: ScatterSeriesConfig[];
  xAxisKey?: string;
  yAxisKey?: string;
  zAxisKey?: string;
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
];

export function BaseScatterChart({
  data,
  series,
  xAxisKey = 'x',
  yAxisKey = 'y',
  zAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: BaseScatterChartProps) {
  const colors = useChartColors();

  if (!data.length) {
    return <ChartEmptyState icon={Target} title={emptyTitle} description={emptyDescription} height={height} />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />}
        <XAxis
          type="number"
          dataKey={xAxisKey}
          name={xAxisKey}
          stroke={colors.muted}
          tick={{ fill: colors.muted, fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey={yAxisKey}
          name={yAxisKey}
          stroke={colors.muted}
          tick={{ fill: colors.muted, fontSize: 12 }}
        />
        {zAxisKey && <ZAxis type="number" dataKey={zAxisKey} range={[60, 400]} name={zAxisKey} />}
        <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: 16 }} />}
        {series.map((s, i) => (
          <Scatter
            key={s.dataKey}
            name={s.name}
            data={data.filter(item => item.category === s.dataKey || !item.category)}
            fill={s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
