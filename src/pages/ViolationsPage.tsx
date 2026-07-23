import { useMemo, useState } from 'react';
import { ViolationTimelineDialog } from '@/components/violations/ViolationTimelineDialog';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, ShieldAlert, AlertTriangle, CheckCircle, Clock, Eye, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { XlsxExportButton } from '@/components/exports/XlsxExportButton';
import { useViolationsPage, type Violation, type ViolationStatus } from '@/hooks/useViolationsPage';
import { useViolationsRealtime } from '@/hooks/useViolationsRealtime';

import { useChartColors } from '@/hooks/useChartColors';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const severityColors: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-info/10 text-info border-info/20',
  low: 'bg-primary/10 text-primary border-primary/20',
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <AlertTriangle className="h-4 w-4 text-destructive" />,
  investigating: <Clock className="h-4 w-4 text-warning" />,
  resolved: <CheckCircle className="h-4 w-4 text-success" />,
  dismissed: <XCircle className="h-4 w-4 text-muted-foreground" />,
};

export default function ViolationsPage() {
  const {
    searchTerm, setSearchTerm,
    severityFilter, setSeverityFilter,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    isDetailsOpen, setIsDetailsOpen,
    isResolveOpen, setIsResolveOpen,
    selectedViolation,
    resolutionNotes, setResolutionNotes,
    violations, allViolations, stats, isLoading, isResolving,
    handleViewDetails, handleOpenResolve, handleResolve,
    VIOLATION_TYPES,
  } = useViolationsPage();

  useViolationsRealtime();

  const colors = useChartColors();


  // Severity chart data
  const severityChartData = useMemo(() => [
    { name: 'Crítica', value: stats.bySeverity.critical, color: colors.destructive },
    { name: 'Alta', value: stats.bySeverity.high, color: colors.warning },
    { name: 'Média', value: stats.bySeverity.medium, color: colors.info },
    { name: 'Baixa', value: stats.bySeverity.low, color: colors.primary },
  ].filter(d => d.value > 0), [stats, colors]);

  // Status distribution
  const statusChartData = useMemo(() => [
    { name: 'Abertas', value: stats.open, color: colors.destructive },
    { name: 'Investigando', value: stats.investigating, color: colors.warning },
    { name: 'Resolvidas', value: stats.resolved, color: colors.success },
  ].filter(d => d.value > 0), [stats, colors]);

  // Tendência dos últimos 7 dias — usa a lista COMPLETA (não filtrada)
  // para evitar métricas enganosas quando o usuário aplica filtros.
  const dailyTrend = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[format(d, 'dd/MM')] = 0;
    }
    allViolations.forEach(v => {
      const key = format(new Date(v.created_at), 'dd/MM');
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [allViolations]);


  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Violações de Segurança</h1>
          <p className="text-muted-foreground mt-1">Gerencie incidentes e violações de políticas</p>
        </div>
        <XlsxExportButton
          filename="violacoes"
          sheets={[{
            name: 'Violações',
            rows: violations.map(v => ({
              Funcionário: v.employee_name,
              Tipo: VIOLATION_TYPES.find(t => t.value === v.violation_type)?.label || v.violation_type,
              Severidade: v.severity,
              Status: v.status,
              Descrição: v.description || '',
              Data: format(new Date(v.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
            })),
          }]}
          disabled={violations.length === 0}
        />
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" /><span className="text-sm text-muted-foreground">Total</span></div><p className="text-3xl font-bold mt-2">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /><span className="text-sm text-muted-foreground">Abertas</span></div><p className="text-3xl font-bold mt-2">{stats.open}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-info" /><span className="text-sm text-muted-foreground">Investigando</span></div><p className="text-3xl font-bold mt-2">{stats.investigating}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-success" /><span className="text-sm text-muted-foreground">Resolvidas</span></div><p className="text-3xl font-bold mt-2">{stats.resolved}</p></CardContent></Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tendência (7 dias)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="violationGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.destructive} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.destructive} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="date" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                  <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" name="Violações" stroke={colors.destructive} fill="url(#violationGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Por Severidade</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                  <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="value" name="Violações" radius={[4, 4, 0, 0]}>
                    {severityChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Por Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {statusChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3">
              {statusChartData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por funcionário ou descrição..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Severidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Aberta</SelectItem>
            <SelectItem value="investigating">Investigando</SelectItem>
            <SelectItem value="resolved">Resolvida</SelectItem>
            <SelectItem value="dismissed">Descartada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {VIOLATION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Violations List */}
      {violations.length === 0 ? (
        <Card><CardContent className="py-0"><EmptyState icon={ShieldAlert} title="Nenhuma violação encontrada" description="Nenhuma violação de segurança registrada no período selecionado. Tudo sob controle!" /></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {violations.map(violation => (
            <Card key={violation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {statusIcons[violation.status]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{violation.employee_name}</span>
                      <Badge variant="outline" className={severityColors[violation.severity]}>{violation.severity}</Badge>
                      <Badge variant="secondary">{VIOLATION_TYPES.find(t => t.value === violation.violation_type)?.label || violation.violation_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{violation.description || 'Sem descrição'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(violation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(violation)}><Eye className="h-4 w-4" /></Button>
                  {violation.status === 'open' && <Button variant="outline" size="sm" onClick={() => handleOpenResolve(violation)}>Resolver</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalhes da Violação</DialogTitle></DialogHeader>
          {selectedViolation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-muted-foreground">Funcionário</label><p className="font-medium">{selectedViolation.employee_name}</p></div>
                <div><label className="text-sm text-muted-foreground">Severidade</label><Badge className={severityColors[selectedViolation.severity]}>{selectedViolation.severity}</Badge></div>
                <div><label className="text-sm text-muted-foreground">Tipo</label><p>{VIOLATION_TYPES.find(t => t.value === selectedViolation.violation_type)?.label}</p></div>
                <div><label className="text-sm text-muted-foreground">Status</label><div className="flex items-center gap-1">{statusIcons[selectedViolation.status]} <span className="capitalize">{selectedViolation.status}</span></div></div>
                <div className="col-span-2"><label className="text-sm text-muted-foreground">Data</label><p>{format(new Date(selectedViolation.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p></div>
                <div className="col-span-2"><label className="text-sm text-muted-foreground">Descrição</label><p>{selectedViolation.description || 'Sem descrição'}</p></div>
                {selectedViolation.resolution_notes && (
                  <div className="col-span-2 border-t pt-3">
                    <label className="text-sm text-muted-foreground">Notas de resolução</label>
                    <p className="text-sm">{selectedViolation.resolution_notes}</p>
                    {selectedViolation.resolved_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Resolvida em {format(new Date(selectedViolation.resolved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={() => setTimelineId(selectedViolation.id)}>
                  Ver timeline detalhada
                </Button>
                {selectedViolation.status === 'open' && (
                  <Button className="flex-1" onClick={() => { setIsDetailsOpen(false); handleOpenResolve(selectedViolation); }}>
                    Resolver Violação
                  </Button>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolver Violação</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Notas de Resolução</label><Textarea placeholder="Descreva as ações tomadas..." value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} rows={4} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleResolve('dismissed' as ViolationStatus)} disabled={isResolving}>Descartar</Button>
            <Button onClick={() => handleResolve('resolved' as ViolationStatus)} disabled={isResolving}>{isResolving ? 'Salvando...' : 'Marcar como Resolvida'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { ViolationsPage };
