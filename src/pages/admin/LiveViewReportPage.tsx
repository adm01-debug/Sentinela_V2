import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileSpreadsheet, FileText, Filter, ShieldCheck, ShieldX, Clock } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useLiveViewReport, formatDuration } from '@/hooks/useLiveViewReport';
import { exportLiveViewCsv, exportLiveViewPdf } from '@/utils/liveViewReportPdf';
import { toast } from 'sonner';

const CONSENT_META: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  granted: { label: 'Consentido', variant: 'default' },
  denied: { label: 'Recusado', variant: 'destructive' },
  timeout: { label: 'Sem resposta', variant: 'outline' },
  not_required: { label: 'Não requerido', variant: 'outline' },
};

function toIso(dateStr: string, endOfDay = false): string {
  const d = new Date(dateStr);
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function LiveViewReportPage() {
  const [fromDate, setFromDate] = useState(todayIso(-7));
  const [toDate, setToDate] = useState(todayIso(0));
  const [agentId, setAgentId] = useState<string>('all');

  const { data: agents } = useQuery({
    queryKey: ['agent-keys-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_keys')
        .select('id, key_name, employee_name')
        .order('key_name');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const filters = useMemo(
    () => ({
      from: toIso(fromDate),
      to: toIso(toDate, true),
      agentId: agentId === 'all' ? null : agentId,
    }),
    [fromDate, toDate, agentId],
  );

  const { data, isLoading } = useLiveViewReport(filters);
  const sessions = data?.sessions ?? [];
  const audit = data?.audit ?? [];

  const periodLabel = `${new Date(fromDate).toLocaleDateString('pt-BR')} — ${new Date(toDate).toLocaleDateString('pt-BR')}`;
  const agentLabel = agentId === 'all'
    ? 'Todos'
    : agents?.find((a) => a.id === agentId)?.employee_name ??
      agents?.find((a) => a.id === agentId)?.key_name ??
      agentId.slice(0, 8);

  const handleCsv = () => {
    if (!sessions.length) { toast.warning('Sem dados para exportar.'); return; }
    exportLiveViewCsv(sessions, audit, periodLabel);
    toast.success('CSV exportado.');
  };
  const handlePdf = () => {
    if (!sessions.length) { toast.warning('Sem dados para exportar.'); return; }
    exportLiveViewPdf(sessions, audit, periodLabel, agentLabel);
    toast.success('PDF exportado.');
  };

  return (
    <PageLayout>
      <PageHeader
        title="Relatório de Live View"
        description="Auditoria completa das sessões de visualização remota, filtráveis por período e agente. Exporte para CSV ou PDF."
      />

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4 text-primary" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="from">De</Label>
            <Input id="from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">Até</Label>
            <Input id="to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Agente</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os agentes</SelectItem>
                {(agents ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.employee_name || a.key_name || a.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" className="flex-1" onClick={handleCsv} disabled={isLoading}>
              <FileSpreadsheet className="mr-2 size-4" /> CSV
            </Button>
            <Button className="flex-1" onClick={handlePdf} disabled={isLoading}>
              <FileText className="mr-2 size-4" /> PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Sessões" value={String(sessions.length)} icon={<Download className="size-4" />} />
        <StatCard
          label="Consentidas"
          value={String(sessions.filter((s) => s.consent_state === 'granted' || s.consent_state === 'not_required').length)}
          icon={<ShieldCheck className="size-4 text-success" />}
        />
        <StatCard
          label="Recusadas"
          value={String(sessions.filter((s) => s.consent_state === 'denied').length)}
          icon={<ShieldX className="size-4 text-destructive" />}
        />
        <StatCard
          label="Tempo total"
          value={formatDuration(sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0))}
          icon={<Clock className="size-4" />}
        />
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sessões ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Início</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Assistido por</TableHead>
                  <TableHead className="text-right">Duração</TableHead>
                  <TableHead>Consentimento</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Encerramento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Carregando…</TableCell></TableRow>
                )}
                {!isLoading && sessions.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Nenhuma sessão no período.</TableCell></TableRow>
                )}
                {sessions.map((s) => {
                  const meta = CONSENT_META[s.consent_state] ?? CONSENT_META.pending;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="tabular-nums text-xs">
                        {new Date(s.started_at ?? s.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{s.agent_label}</TableCell>
                      <TableCell>{s.viewer_label}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatDuration(s.duration_seconds)}</TableCell>
                      <TableCell><Badge variant={meta.variant}>{meta.label}</Badge></TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">{s.consent_reason ?? '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.end_reason ?? '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Eventos de auditoria ({audit.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[420px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Sessão</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">Sem eventos.</TableCell></TableRow>
                )}
                {audit.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="tabular-nums text-xs">{new Date(a.created_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="font-mono text-xs">{a.session_id.slice(0, 8)}</TableCell>
                    <TableCell><Badge variant="outline">{a.event}</Badge></TableCell>
                    <TableCell className="max-w-[420px] truncate font-mono text-xs text-muted-foreground">
                      {a.payload ? JSON.stringify(a.payload) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs uppercase text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
        </div>
        <div className="rounded-md bg-muted p-2">{icon}</div>
      </CardContent>
    </Card>
  );
}
