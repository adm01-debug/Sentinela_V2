import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';
import { ChartTooltipContent } from './ChartTooltip';
import { ChartEmptyState } from './ChartEmptyState';
import { Activity } from 'lucide-react';

export interface RadarSeriesConfig {
  dataKey: string;
  label: string;
  color?: string;
  fillOpacity?: number;
}

interface BaseRadarChartProps {
  data: unknown[];
  series: RadarSeriesConfig[];
  angleKey?: string;
  height?: number;
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

export function BaseRadarChart({
  data,
  series,
  angleKey = 'subject',
  height = 350,
  showLegend = true,
  valueFormatter,
  emptyTitle,
  emptyDescription,
}: BaseRadarChartProps) {
  const colors = useChartColors();

  if (!data.length) {
    return <ChartEmptyState icon={Activity} title={emptyTitle} description={emptyDescription} height={height} />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke={colors.border} />
        <PolarAngleAxis
          dataKey={angleKey}
          tick={{ fill: colors.muted, fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 'auto']}
          tick={{ fill: colors.muted, fontSize: 10 }}
        />
        <Tooltip content={<ChartTooltipContent valueFormatter={valueFormatter} />} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: 16 }} />}
        {series.map((s, i) => {
          const color = s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <Radar
              key={s.dataKey}
              name={s.label}
              dataKey={s.dataKey}
              stroke={color}
              fill={color}
              fillOpacity={s.fillOpacity ?? 0.6}
            />
          );
        })}
      </RadarChart>
    </ResponsiveContainer>
  );
}
