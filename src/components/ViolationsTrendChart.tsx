import { useMemo, useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { useChartColors } from '@/hooks/useChartColors';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SecurityViolation } from '@/hooks/useSecurityViolations';
import { ViolationsDrilldownDialog } from './ViolationsDrilldownDialog';

interface ViolationsTrendChartProps {
  violations: SecurityViolation[];
  /** Callback opcional quando o usuário clica em um ponto do gráfico. */
  onDateSelect?: (dateISO: string) => void;
  /** Desativa o diálogo interno de drill-down. */
  disableInternalDrilldown?: boolean;
}

type Period = '7d' | '30d' | '90d';

export function ViolationsTrendChart({
  violations,
  onDateSelect,
  disableInternalDrilldown = false,
}: ViolationsTrendChartProps) {
  const [period, setPeriod] = useState<Period>('30d');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { chartData, trend } = useMemo(() => {
    const now = new Date();
    const daysMap: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[period];
    const startDate = startOfDay(subDays(now, days - 1));

    const dates = eachDayOfInterval({ start: startDate, end: now });

    const grouped = dates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayViolations = violations.filter(v =>
        format(new Date(v.created_at), 'yyyy-MM-dd') === dateStr
      );

      return {
        date: format(date, period === '7d' ? 'EEE' : 'dd/MM', { locale: ptBR }),
        fullDate: dateStr,
        total: dayViolations.length,
        critical: dayViolations.filter(v => v.severity === 'critical').length,
        high: dayViolations.filter(v => v.severity === 'high').length,
        medium: dayViolations.filter(v => v.severity === 'medium').length,
        low: dayViolations.filter(v => v.severity === 'low').length,
      };
    });

    const midpoint = Math.floor(grouped.length / 2);
    const firstHalf = grouped.slice(0, midpoint);
    const secondHalf = grouped.slice(midpoint);

    const firstHalfTotal = firstHalf.reduce((sum, d) => sum + d.total, 0);
    const secondHalfTotal = secondHalf.reduce((sum, d) => sum + d.total, 0);

    let trendValue: 'up' | 'down' | 'stable' = 'stable';
    let trendPercent = 0;

    if (firstHalfTotal > 0) {
      trendPercent = Math.round(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100);
      if (trendPercent > 5) trendValue = 'up';
      else if (trendPercent < -5) trendValue = 'down';
    }

    return {
      chartData: grouped,
      trend: { direction: trendValue, percent: Math.abs(trendPercent) }
    };
  }, [violations, period]);

  const c = useChartColors();

  const TrendIcon = trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus;
  const trendColor = trend.direction === 'up' ? 'text-destructive' : trend.direction === 'down' ? 'text-success' : 'text-muted-foreground';

  const handleChartClick = (state: unknown) => {
    const s = state as { activePayload?: Array<{ payload?: { fullDate?: string } }> } | null;
    const iso = s?.activePayload?.[0]?.payload?.fullDate;
    if (!iso) return;
    onDateSelect?.(iso);
    if (!disableInternalDrilldown) {
      setSelectedDate(iso);
      setOpen(true);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Tendência de Violações</h3>
          <div className="flex items-center gap-2 mt-1">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={`text-sm ${trendColor}`}>
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.percent}%
              {trend.direction === 'up' ? ' aumento' : trend.direction === 'down' ? ' redução' : ' estável'}
            </span>
            <span className="text-xs text-muted-foreground">vs período anterior</span>
          </div>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          onClick={handleChartClick}
          style={{ cursor: 'pointer' }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={c.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={c.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={c.destructive} stopOpacity={0.3} />
              <stop offset="95%" stopColor={c.destructive} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
          <XAxis
            dataKey="date"
            stroke={c.muted}
            tick={{ fill: c.muted, fontSize: 12 }}
            interval={period === '90d' ? 6 : period === '30d' ? 2 : 0}
          />
          <YAxis
            stroke={c.muted}
            tick={{ fill: c.muted, fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: c.card,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
            }}
            labelStyle={{ color: c.foreground }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                total: 'Total',
                critical: 'Críticas',
                high: 'Alta',
                medium: 'Média',
                low: 'Baixa',
              };
              return <span style={{ color: c.muted }}>{labels[value] || value}</span>;
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={c.primary}
            fillOpacity={1}
            fill="url(#colorTotal)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="critical"
            stroke={c.destructive}
            fillOpacity={1}
            fill="url(#colorCritical)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke={c.warning}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {!disableInternalDrilldown && (
        <ViolationsDrilldownDialog
          open={open}
          onOpenChange={setOpen}
          dateRange={selectedDate ? { from: selectedDate, to: selectedDate } : null}
          violations={violations}
        />
      )}
    </div>
  );
}
