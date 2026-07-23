import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Loader2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, startOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChartColors } from '@/hooks/useChartColors';

interface DeliveryEvent {
  integration_id: string | null;
  success: boolean;
  created_at: string;
}

interface Integration {
  id: string;
  name: string;
}

interface DailyPoint {
  day: string;
  label: string;
  success: number;
  failure: number;
  total: number;
  uptime: number;
}

interface IntegrationSeries {
  integration: Integration;
  daily: DailyPoint[];
  uptime7d: number;
  total7d: number;
}

const DAYS = 7;

export function SlackUptimeHistoryCard() {
  const colors = useChartColors();

  const { data, isLoading } = useQuery({
    queryKey: ['slack-uptime-history'],
    refetchInterval: 60_000,
    queryFn: async (): Promise<IntegrationSeries[]> => {
      const since = subDays(startOfDay(new Date()), DAYS - 1).toISOString();
      const [{ data: integrations, error: intErr }, { data: events, error: evErr }] = await Promise.all([
        supabase.from('slack_integrations').select('id, name').order('name'),
        supabase
          .from('slack_delivery_events')
          .select('integration_id, success, created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: true })
          .limit(10_000),
      ]);
      if (intErr) throw intErr;
      if (evErr) throw evErr;

      const days: string[] = Array.from({ length: DAYS }, (_, i) =>
        format(subDays(startOfDay(new Date()), DAYS - 1 - i), 'yyyy-MM-dd'),
      );

      return (integrations ?? []).map((integration) => {
        const buckets = new Map<string, { success: number; failure: number }>();
        for (const d of days) buckets.set(d, { success: 0, failure: 0 });

        for (const ev of (events ?? []) as DeliveryEvent[]) {
          if (ev.integration_id !== integration.id) continue;
          const key = format(new Date(ev.created_at), 'yyyy-MM-dd');
          const bucket = buckets.get(key);
          if (!bucket) continue;
          if (ev.success) bucket.success += 1;
          else bucket.failure += 1;
        }

        const daily: DailyPoint[] = days.map((day) => {
          const b = buckets.get(day)!;
          const total = b.success + b.failure;
          const uptime = total === 0 ? 100 : Math.round((b.success / total) * 100);
          return {
            day,
            label: format(new Date(day), 'dd/MM', { locale: ptBR }),
            success: b.success,
            failure: b.failure,
            total,
            uptime,
          };
        });

        const total7d = daily.reduce((a, d) => a + d.total, 0);
        const success7d = daily.reduce((a, d) => a + d.success, 0);
        const uptime7d = total7d === 0 ? 100 : Math.round((success7d / total7d) * 100);

        return { integration, daily, uptime7d, total7d };
      });
    },
  });

  const totals = useMemo(() => {
    if (!data) return { channels: 0, envios: 0, uptime: 100 };
    const envios = data.reduce((a, s) => a + s.total7d, 0);
    const success = data.reduce(
      (a, s) => a + s.daily.reduce((x, d) => x + d.success, 0),
      0,
    );
    const uptime = envios === 0 ? 100 : Math.round((success / envios) * 100);
    return { channels: data.length, envios, uptime };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Uptime por canal Slack — últimos 7 dias
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-3">
          <span>Sucesso vs. falha diária de cada webhook configurado.</span>
          <Badge variant="outline">{totals.channels} canais</Badge>
          <Badge variant="outline">{totals.envios} envios</Badge>
          <Badge variant={totals.uptime >= 99 ? 'default' : totals.uptime >= 95 ? 'secondary' : 'destructive'}>
            Uptime global: {totals.uptime}%
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando telemetria…
          </div>
        ) : !data || data.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma integração Slack configurada. Adicione um webhook para começar a registrar telemetria.
          </div>
        ) : (
          data.map((series) => (
            <div key={series.integration.id} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{series.integration.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {series.total7d} envios em 7d
                  </Badge>
                </div>
                <Badge
                  variant={
                    series.uptime7d >= 99
                      ? 'default'
                      : series.uptime7d >= 95
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {series.uptime7d}% uptime
                </Badge>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series.daily} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={colors.muted} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke={colors.muted} />
                    <Tooltip
                      contentStyle={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                      formatter={(value: number, key: string) => [
                        value,
                        key === 'success' ? 'Sucesso' : 'Falha',
                      ]}
                      labelFormatter={(l) => `Dia ${l}`}
                    />
                    <Bar dataKey="success" stackId="a" fill={colors.success} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="failure" stackId="a" fill={colors.destructive} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
