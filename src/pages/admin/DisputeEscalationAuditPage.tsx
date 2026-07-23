import { useQuery } from '@tanstack/react-query';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, ShieldAlert, Activity, Heart, Download } from 'lucide-react';
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

type Severity = 'warning' | 'critical' | 'breached';

interface EscalationRow {
  id: string;
  created_at: string;
  status: string;
  message: string;
  metadata: {
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
    return (
      <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">Crítico</Badge>
    );
  if (s === 'warning')
    return <Badge className="bg-warning/20 text-warning hover:bg-warning/30">Atenção</Badge>;
  return <Badge variant="outline">—</Badge>;
}

export default function DisputeEscalationAuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dispute-escalation-audit'],
    queryFn: async (): Promise<EscalationRow[]> => {
      const { data, error } = await supabase
        .from('edge_function_logs')
        .select('id, created_at, status, message, metadata')
        .eq('function_name', 'escalate-dispute-sla')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as EscalationRow[];
    },
    refetchInterval: 60_000,
  });

  const rows = data ?? [];
  const breached = rows.filter((r) => r.metadata?.severity === 'breached').length;
  const critical = rows.filter((r) => r.metadata?.severity === 'critical').length;
  const warning = rows.filter((r) => r.metadata?.severity === 'warning').length;
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

  function handleExportCsv() {
    const header = ['created_at', 'severity', 'dispute_id', 'hours_until_breach', 'push_delivered', 'status', 'message'];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.created_at,
          r.metadata?.severity ?? '',
          r.metadata?.dispute_id ?? '',
          r.metadata?.hours_until_breach ?? '',
          r.metadata?.push_delivered ?? 0,
          r.status,
          r.message,
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
        description="Histórico automático das últimas escalações disparadas pela função escalate-dispute-sla (execução a cada 15min)."
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Heart className={
              heartbeatStatus === 'ok' ? 'h-4 w-4 text-success animate-pulse' :
              heartbeatStatus === 'warn' ? 'h-4 w-4 text-warning' :
              'h-4 w-4 text-destructive'
            } />
            Saúde do Cron (escalate-dispute-sla)
          </CardTitle>
          <Badge
            variant={heartbeatStatus === 'ok' ? 'default' : heartbeatStatus === 'warn' ? 'secondary' : 'destructive'}
          >
            {heartbeatStatus === 'ok' ? 'Saudável' : heartbeatStatus === 'warn' ? 'Atenção' : 'Inativo'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {lastRun
              ? `Última execução: ${format(lastRun, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} (${minutesSinceLastRun} min atrás)`
              : 'Sem execuções registradas nas últimas 200 entradas. Verifique o agendamento pg_cron.'}
          </div>
          {heartbeatStatus === 'down' && (
            <p className="text-xs text-destructive mt-2">
              Cron não executa há mais de 60 minutos. Verifique <code>cron.job</code> no banco e a função edge.
            </p>
          )}
        </CardContent>
      </Card>


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
              Nenhuma escalação registrada ainda. O cron roda a cada 15 minutos.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Contestação</TableHead>
                  <TableHead className="text-right">Horas restantes</TableHead>
                  <TableHead className="text-right">Push entregues</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(row.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{severityBadge(row.metadata?.severity)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.metadata?.dispute_id?.slice(0, 8) ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.metadata?.hours_until_breach ?? '—'}h
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.metadata?.push_delivered ?? 0}
                    </TableCell>
                    <TableCell className="text-xs max-w-md truncate">{row.message}</TableCell>
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
