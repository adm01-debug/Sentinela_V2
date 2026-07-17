import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { useChartColors } from '@/hooks/useChartColors';

interface ActivityChartProps { data: Array<{ date: string; value: number }>; title?: string; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md">
      <p className="text-sm font-medium text-popover-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        Atividades: <span className="font-medium text-popover-foreground">{payload[0].value}</span>
      </p>
    </div>
  );
};

export const ActivityChart = ({ data, title = 'Atividade' }: ActivityChartProps) => {
  const c = useChartColors();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={c.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fill: c.muted, fontSize: 12 }} />
                <YAxis tick={{ fill: c.muted, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke={c.primary} strokeWidth={2} fill="url(#activityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Activity className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Sem dados de atividade</p>
              <p className="text-xs">Os dados aparecerão conforme os funcionários forem monitorados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
