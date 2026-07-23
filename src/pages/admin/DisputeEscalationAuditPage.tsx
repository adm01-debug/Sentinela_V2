import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, differenceInMinutes, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  ShieldAlert,
  Activity,
  Heart,
  Download,
  PlayCircle,
  Gauge,
  Loader2,
  BarChart3,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useChartColors } from '@/hooks/useChartColors';

type Severity = 'warning' | 'critical' | 'breached';

interface EscalationRow {
  id: string;
  created_at: string;
  status: number | null;
  duration_ms: number | null;
  error_message: string | null;
  payload_summary: {
    title?: string;
    dispute_id?: string;
    violation_id?: string;
    severity?: Severity;
    hours_until_breach?: number;
    push_delivered?: number;
    dedup_key?: string;
  } | null;
}

function severityBadge(s: Severity | undefined) {
  if (s === 'breached') return <Badge variant="destructive">Violado</Badge>;
  if (s === 'critical')
    return <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">Crítico</Badge>;
  if (s === 'warning')
    return <Badge className="bg-warning/20 text-warning hover:bg-warning/30">Atenção</Badge>;
  return <Badge variant="outline">—</Badge>;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

export default function DisputeEscalationAuditPage() {
  const queryClient = useQueryClient();
  const [invoking, setInvoking] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dispute-escalation-audit'],
    queryFn: async (): Promise<EscalationRow[]> => {
      const { data, error } = await supabase
        .from('edge_function_logs')
        .select('id, created_at, status, duration_ms, error_message, payload_summary')
        .eq('function_name', 'escalate-dispute-sla')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as EscalationRow[];
    },
    refetchInterval: 60_000,
  });

  const rows = useMemo(() => data ?? [], [data]);
  const breached = rows.filter((r) => r.payload_summary?.severity === 'breached').length;
  const critical = rows.filter((r) => r.payload_summary?.severity === 'critical').length;
  const warning = rows.filter((r) => r.payload_summary?.severity === 'warning').length;
  const lastRun = rows[0]?.created_at ? new Date(rows[0].created_at) : null;
  const minutesSinceLastRun = lastRun ? differenceInMinutes(new Date(), lastRun) : null;
  const heartbeatStatus: 'ok' | 'warn' | 'down' =
    minutesSinceLastRun === null
      ? 'warn'
      : minutesSinceLastRun > 60
        ? 'down'
        : minutesSinceLastRun > 30
          ? 'warn'
          : 'ok';

  // Métricas de performance (últimas 200 execuções).
  const durations = rows.map((r) => r.duration_ms ?? 0).filter((d) => d > 0);
  const p50 = percentile(durations, 50);
  const p95 = percentile(durations, 95);
  const successRate = rows.length === 0
    ? 100
    : Math.round((rows.filter((r) => (r.status ?? 500) < 400).length / rows.length) * 100);

  // Alerta realtime quando heartbeat degrada.
  useEffect(() => {
    if (heartbeatStatus === 'down') {
      toast.error('Cron de escalação inativo há mais de 60 minutos', {
        description: 'Verifique o agendamento pg_cron imediatamente.',
        id: 'heartbeat-down',
      });
    } else if (heartbeatStatus === 'warn' && minutesSinceLastRun && minutesSinceLastRun > 30) {
      toast.warning('Cron de escalação atrasado', {
        description: `Última execução há ${minutesSinceLastRun} minutos.`,
        id: 'heartbeat-warn',
      });
    }
  }, [heartbeatStatus, minutesSinceLastRun]);

  async function handleManualTrigger() {
    setInvoking(true);
    try {
      const { data, error } = await supabase.functions.invoke('escalate-dispute-sla', {
        body: { manual: true, triggered_at: new Date().toISOString() },
      });
      if (error) throw error;
      const summary = data as { escalated?: number; checked?: number } | null;
      toast.success('Escalação executada manualmente', {
        description: `Verificadas: ${summary?.checked ?? 0} · Escaladas: ${summary?.escalated ?? 0}`,
      });
      await queryClient.invalidateQueries({ queryKey: ['dispute-escalation-audit'] });
    } catch (err) {
      toast.error('Falha ao executar escalação', {
        description: err instanceof Error ? err.message : 'Erro desconhecido',
      });
    } finally {
      setInvoking(false);
    }
  }

  function handleExportCsv() {
    const header = [
      'created_at', 'severity', 'dispute_id', 'hours_until_breach',
      'push_delivered', 'status', 'duration_ms', 'error_message',
    ];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.created_at,
          r.payload_summary?.severity ?? '',
          r.payload_summary?.dispute_id ?? '',
          r.payload_summary?.hours_until_breach ?? '',
          r.payload_summary?.push_delivered ?? 0,
          r.status ?? '',
          r.duration_ms ?? '',
          r.error_message ?? r.payload_summary?.title ?? '',
        ].map(escape).join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escalacoes-sla-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageLayout>
      <PageHeader
        title="Auditoria de Escalações de SLA"
        description="Histórico das escalações da função escalate-dispute-sla (cron a cada 15min)."
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={handleManualTrigger} disabled={invoking}>
              {invoking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              Executar agora
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={rows.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart
                className={
                  heartbeatStatus === 'ok'
                    ? 'h-4 w-4 text-success animate-pulse'
                    : heartbeatStatus === 'warn'
                      ? 'h-4 w-4 text-warning'
                      : 'h-4 w-4 text-destructive'
                }
              />
              Saúde do Cron
            </CardTitle>
            <Badge
              variant={
                heartbeatStatus === 'ok'
                  ? 'default'
                  : heartbeatStatus === 'warn'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {heartbeatStatus === 'ok' ? 'Saudável' : heartbeatStatus === 'warn' ? 'Atenção' : 'Inativo'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {lastRun
                ? `Última execução: ${format(lastRun, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} (${minutesSinceLastRun} min atrás)`
                : 'Sem execuções registradas. Verifique o agendamento pg_cron.'}
            </div>
            {heartbeatStatus === 'down' && (
              <p className="text-xs text-destructive mt-2">
                Cron não executa há mais de 60 minutos. Use "Executar agora" e verifique{' '}
                <code>cron.job</code>.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              Performance da Função
            </CardTitle>
            <Badge variant={successRate >= 95 ? 'default' : successRate >= 80 ? 'secondary' : 'destructive'}>
              {successRate}% sucesso
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Latência p50</div>
                <div className="text-lg font-bold tabular-nums">{p50}ms</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Latência p95</div>
                <div className="text-lg font-bold tabular-nums">{p95}ms</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Baseado nas últimas {durations.length} execuções com duração registrada.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLAs Violados</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{breached}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos (≤4h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atenção (≤12h)</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warning}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas 200 escalações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhuma escalação registrada ainda. Use "Executar agora" para forçar uma verificação.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Contestação</TableHead>
                  <TableHead className="text-right">Horas restantes</TableHead>
                  <TableHead className="text-right">Push</TableHead>
                  <TableHead className="text-right">Duração</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(row.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{severityBadge(row.payload_summary?.severity)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.payload_summary?.dispute_id?.slice(0, 8) ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.payload_summary?.hours_until_breach ?? '—'}h
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.payload_summary?.push_delivered ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                      {row.duration_ms ?? '—'}ms
                    </TableCell>
                    <TableCell className="text-xs max-w-md truncate">
                      {row.error_message ?? row.payload_summary?.title ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
