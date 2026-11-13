import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, differenceInMinutes, subHours, startOfHour } from 'date-fns';
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
  FileText,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { exportEscalationAuditPdf } from '@/utils/escalationAuditPdf';
import { SlackIntegrationsCard } from '@/components/admin/SlackIntegrationsCard';
import { SlackDlqCard } from '@/components/admin/SlackDlqCard';
import { SlackWebhookMttrCard } from '@/components/admin/SlackWebhookMttrCard';
import { SlackUptimeHistoryCard } from '@/components/admin/SlackUptimeHistoryCard';
import { SlackFallbackSettingsCard } from '@/components/admin/SlackFallbackSettingsCard';
import { SlackFallbackHistoryCard } from '@/components/admin/SlackFallbackHistoryCard';


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
  const chartColors = useChartColors();
  const [invoking, setInvoking] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');


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

  // Histograma de latência por bucket (ms).
  const histogram = useMemo(() => {
    const buckets = [
      { label: '<100ms', min: 0, max: 100, count: 0 },
      { label: '100-300', min: 100, max: 300, count: 0 },
      { label: '300-600', min: 300, max: 600, count: 0 },
      { label: '600ms-1s', min: 600, max: 1000, count: 0 },
      { label: '1-2s', min: 1000, max: 2000, count: 0 },
      { label: '2-5s', min: 2000, max: 5000, count: 0 },
      { label: '>5s', min: 5000, max: Infinity, count: 0 },
    ];
    for (const d of durations) {
      const b = buckets.find((x) => d >= x.min && d < x.max);
      if (b) b.count += 1;
    }
    return buckets;
  }, [durations]);

  // Taxa de erro nas últimas 24h + falhas acionáveis.
  const cutoff24h = subHours(new Date(), 24);
  const last24h = rows.filter((r) => new Date(r.created_at) >= cutoff24h);
  const errors24h = last24h.filter((r) => (r.status ?? 500) >= 400);
  const errorRate24h = last24h.length === 0
    ? 0
    : Math.round((errors24h.length / last24h.length) * 100);
  const errorTrend: 'ok' | 'watch' | 'alert' =
    errorRate24h >= 15 ? 'alert' : errorRate24h >= 5 ? 'watch' : 'ok';
  const recentErrors = errors24h.slice(0, 5);

  // Timeline de execuções por hora (últimas 24h) — expõe gaps do cron.
  const timeline = useMemo(() => {
    const bucketMap = new Map<number, { ok: number; fail: number }>();
    for (let i = 23; i >= 0; i -= 1) {
      const ts = startOfHour(subHours(new Date(), i)).getTime();
      bucketMap.set(ts, { ok: 0, fail: 0 });
    }
    for (const r of last24h) {
      const key = startOfHour(new Date(r.created_at)).getTime();
      const b = bucketMap.get(key);
      if (!b) continue;
      if ((r.status ?? 500) < 400) b.ok += 1;
      else b.fail += 1;
    }
    return Array.from(bucketMap.entries()).map(([ts, v]) => ({
      hour: format(new Date(ts), 'HH:mm'),
      ok: v.ok,
      fail: v.fail,
      total: v.ok + v.fail,
    }));
  }, [last24h]);

  // Filtro de severidade aplicado à tabela.
  const filteredRows = useMemo(
    () =>
      severityFilter === 'all'
        ? rows
        : rows.filter((r) => r.payload_summary?.severity === severityFilter),
    [rows, severityFilter],
  );


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

  function handleExportPdf() {
    try {
      exportEscalationAuditPdf({
        generatedAt: new Date(),
        heartbeat: {
          status: heartbeatStatus,
          lastRun,
          minutesSinceLastRun,
        },
        performance: { p50, p95, successRate, sampleSize: durations.length },
        counts: { breached, critical, warning, total: rows.length },
        errors24h: {
          errorRate: errorRate24h,
          total: last24h.length,
          failed: errors24h.length,
          recent: recentErrors.map((e) => ({
            created_at: e.created_at,
            status: e.status,
            message: e.error_message ?? e.payload_summary?.title ?? 'Falha desconhecida',
          })),
        },
        histogram: histogram.map((h) => ({ label: h.label, count: h.count })),
      });
      toast.success('PDF gerado com sucesso');
    } catch (err) {
      toast.error('Falha ao gerar PDF', {
        description: err instanceof Error ? err.message : 'Erro desconhecido',
      });
    }
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
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={rows.length === 0}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-primary" />
            Execuções por hora (últimas 24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeline} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
              <XAxis dataKey="hour" tick={{ fill: chartColors.muted, fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: chartColors.muted, fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.card,
                  border: `1px solid ${chartColors.border}`,
                  borderRadius: 8,
                  color: chartColors.foreground,
                }}
              />
              <Line
                type="monotone"
                dataKey="ok"
                name="Sucesso"
                stroke={chartColors.success}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="fail"
                name="Falhas"
                stroke={chartColors.destructive}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">
            Gaps consecutivos indicam falha do agendamento pg_cron. Esperado: ~4 execuções/h.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3 mb-6">

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Distribuição de Latência
            </CardTitle>
          </CardHeader>
          <CardContent>
            {durations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Sem dados de duração ainda.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={histogram} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                  <XAxis dataKey="label" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: chartColors.muted, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.card,
                      border: `1px solid ${chartColors.border}`,
                      borderRadius: 8,
                      color: chartColors.foreground,
                    }}
                    formatter={(value) => [`${value} execuções`, 'Quantidade']}
                  />
                  <Bar dataKey="count" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Distribuição em {durations.length} execuções. p95: <strong>{p95}ms</strong>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle
                className={
                  errorTrend === 'alert'
                    ? 'h-4 w-4 text-destructive'
                    : errorTrend === 'watch'
                      ? 'h-4 w-4 text-warning'
                      : 'h-4 w-4 text-success'
                }
              />
              Taxa de Erro 24h
            </CardTitle>
            <Badge
              variant={
                errorTrend === 'alert' ? 'destructive' : errorTrend === 'watch' ? 'secondary' : 'default'
              }
            >
              {errorRate24h}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {errors24h.length}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                / {last24h.length} execuções
              </span>
            </div>
            <div className="mt-3 space-y-1.5 max-h-32 overflow-auto">
              {recentErrors.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma falha nas últimas 24h.</p>
              ) : (
                recentErrors.map((e) => (
                  <div key={e.id} className="text-xs border-l-2 border-destructive/60 pl-2">
                    <div className="text-muted-foreground">
                      {format(new Date(e.created_at), 'dd/MM HH:mm', { locale: ptBR })} · HTTP {e.status ?? '?'}
                    </div>
                    <div className="truncate text-foreground">
                      {e.error_message ?? e.payload_summary?.title ?? 'Falha desconhecida'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <SlackIntegrationsCard />
        <SlackDlqCard />
        <SlackWebhookMttrCard />
        <SlackUptimeHistoryCard />
        <SlackFallbackSettingsCard />
        <SlackFallbackHistoryCard />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Últimas 200 escalações</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtrar:</span>
            <Select
              value={severityFilter}
              onValueChange={(v) => setSeverityFilter(v as 'all' | Severity)}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ({rows.length})</SelectItem>
                <SelectItem value="breached">Violado ({breached})</SelectItem>
                <SelectItem value="critical">Crítico ({critical})</SelectItem>
                <SelectItem value="warning">Atenção ({warning})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredRows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {rows.length === 0
                ? 'Nenhuma escalação registrada ainda. Use "Executar agora" para forçar uma verificação.'
                : 'Nenhuma escalação corresponde ao filtro selecionado.'}
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
                {filteredRows.map((row) => (
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

