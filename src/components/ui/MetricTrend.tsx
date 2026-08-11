import { memo, useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChartColors } from '@/hooks/useChartColors';

export interface MetricTrendProps {
  /** Numeric series (oldest → newest). */
  data: number[];
  /** Optional explicit tone; otherwise derived from slope. */
  tone?: 'success' | 'destructive' | 'muted';
  height?: number;
  className?: string;
  label?: string;
  /** Show numeric delta % between first and last sample. */
  showDelta?: boolean;
}

function deriveTone(data: number[]): 'success' | 'destructive' | 'muted' {
  if (data.length < 2) return 'muted';
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first) return 'success';
  if (last < first) return 'destructive';
  return 'muted';
}

export const MetricTrend = memo(function MetricTrend({
  data,
  tone,
  height = 40,
  className,
  label,
  showDelta = false,
}: MetricTrendProps) {
  const colors = useChartColors();
  const resolvedTone = tone ?? deriveTone(data);

  const strokeColor =
    resolvedTone === 'success'
      ? colors.success
      : resolvedTone === 'destructive'
        ? colors.destructive
        : colors.muted;

  const chartData = useMemo(
    () => data.map((v, i) => ({ i, v })),
    [data]
  );

  const delta = useMemo(() => {
    if (data.length < 2 || data[0] === 0) return null;
    const first = data[0];
    const last = data[data.length - 1];
    return ((last - first) / Math.abs(first)) * 100;
  }, [data]);

  const TrendIcon =
    resolvedTone === 'success'
      ? TrendingUp
      : resolvedTone === 'destructive'
        ? TrendingDown
        : Minus;

  const gradientId = useMemo(
    () => `metric-trend-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  return (
    <div
      className={cn('flex items-center gap-3', className)}
      role="img"
      aria-label={
        label ??
        (delta !== null
          ? `Tendência ${delta >= 0 ? 'de alta' : 'de baixa'} de ${Math.abs(delta).toFixed(1)}%`
          : 'Tendência estável')
      }
    >
      <div className="flex-1 min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {showDelta && delta !== null && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium tabular-nums',
            resolvedTone === 'success' && 'text-success',
            resolvedTone === 'destructive' && 'text-destructive',
            resolvedTone === 'muted' && 'text-muted-foreground'
          )}
        >
          <TrendIcon className="h-3 w-3" aria-hidden="true" />
          {Math.abs(delta).toFixed(1)}%
        </div>
      )}
    </div>
  );
});

export default MetricTrend;
