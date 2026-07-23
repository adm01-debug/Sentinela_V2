import { useMutation, useQuery } from '@tanstack/react-query';
import { Activity, Loader2, Siren, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MttrRow {
  integration_id: string;
  integration_name: string;
  recovery_events: number;
  mttr_avg_seconds: number;
  mttr_p50_seconds: number;
  mttr_p95_seconds: number;
  mttr_max_seconds: number;
}

function fmt(sec: number | null | undefined): string {
  if (!sec || sec < 0) return '—';
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}min`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)}h`;
  return `${(sec / 86400).toFixed(1)}d`;
}

function severityForMttr(sec: number): 'default' | 'secondary' | 'destructive' {
  if (sec < 300) return 'default'; // < 5min
  if (sec < 3600) return 'secondary'; // < 1h
  return 'destructive';
}

export function SlackWebhookMttrCard() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['slack-webhook-mttr'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slack_webhook_mttr' as never)
        .select('*')
        .order('mttr_p95_seconds', { ascending: false });
      if (error) throw error;
      return (data ?? []) as MttrRow[];
    },
    refetchInterval: 60_000,
  });

  const runMonitor = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('slack-mttr-monitor', {
        body: { trigger: 'manual' },
      });
      if (error) throw error;
      return data as { alerts?: Array<{ integration: string; severity: string }>; checked?: number };
    },
    onSuccess: (res) => {
      const n = res.alerts?.length ?? 0;
      toast.success(
        n === 0
          ? `Verificação concluída — ${res.checked ?? 0} integrações analisadas, sem degradação.`
          : `${n} alerta(s) proativo(s) disparados no Slack.`,
      );
    },
    onError: (err: Error) => toast.error(`Falha na verificação: ${err.message}`),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            MTTR de webhooks Slack
          </CardTitle>
          <CardDescription>
            Tempo entre auto-pausa da integração e o primeiro reenvio bem-sucedido. Alertas
            proativos rodam a cada hora quando p95 ≥ 30min.
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => runMonitor.mutate()}
          disabled={runMonitor.isPending}
        >
          {runMonitor.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Siren className="mr-2 h-4 w-4" />
          )}
          Verificar agora
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculando…
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-success" />
            Nenhuma auto-pausa recuperada ainda. Os dados aparecem após o primeiro replay
            bem-sucedido pós-pausa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">Integração</th>
                  <th className="pb-2 pr-4">Eventos</th>
                  <th className="pb-2 pr-4">Médio</th>
                  <th className="pb-2 pr-4">p50</th>
                  <th className="pb-2 pr-4">p95</th>
                  <th className="pb-2">Máx.</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.integration_id} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">{row.integration_name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{row.recovery_events}</td>
                    <td className="py-2 pr-4">{fmt(row.mttr_avg_seconds)}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={severityForMttr(row.mttr_p50_seconds)}>
                        {fmt(row.mttr_p50_seconds)}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={severityForMttr(row.mttr_p95_seconds)}>
                        {fmt(row.mttr_p95_seconds)}
                      </Badge>
                    </td>
                    <td className="py-2 text-muted-foreground">{fmt(row.mttr_max_seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
