import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, ShieldAlert, AlertTriangle, CheckCircle, Clock, Eye, XCircle, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useViolationsPage, type Violation, type ViolationStatus } from '@/hooks/useViolationsPage';

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-600 border-red-200',
  high: 'bg-orange-500/10 text-orange-600 border-orange-200',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  low: 'bg-blue-500/10 text-blue-600 border-blue-200',
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <AlertTriangle className="h-4 w-4 text-red-500" />,
  investigating: <Clock className="h-4 w-4 text-yellow-500" />,
  resolved: <CheckCircle className="h-4 w-4 text-green-500" />,
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
    violations, stats, isLoading, isResolving,
    handleViewDetails, handleOpenResolve, handleResolve,
    VIOLATION_TYPES,
  } = useViolationsPage();

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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Abertas</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Investigando</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.investigating}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Resolvidas</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Severity Breakdown */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-red-500/10 text-red-600">Críticas: {stats.bySeverity.critical}</Badge>
        <Badge variant="outline" className="bg-orange-500/10 text-orange-600">Altas: {stats.bySeverity.high}</Badge>
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">Médias: {stats.bySeverity.medium}</Badge>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600">Baixas: {stats.bySeverity.low}</Badge>
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
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma violação encontrada com os filtros selecionados.</p>
          </CardContent>
        </Card>
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
                      <Badge variant="outline" className={severityColors[violation.severity]}>
                        {violation.severity}
                      </Badge>
                      <Badge variant="secondary">
                        {VIOLATION_TYPES.find(t => t.value === violation.violation_type)?.label || violation.violation_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {violation.description || 'Sem descrição'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(violation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(violation)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {violation.status === 'open' && (
                    <Button variant="outline" size="sm" onClick={() => handleOpenResolve(violation)}>
                      Resolver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Violação</DialogTitle>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Funcionário</label>
                  <p className="font-medium">{selectedViolation.employee_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Severidade</label>
                  <Badge className={severityColors[selectedViolation.severity]}>{selectedViolation.severity}</Badge>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <p>{VIOLATION_TYPES.find(t => t.value === selectedViolation.violation_type)?.label}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="flex items-center gap-1">{statusIcons[selectedViolation.status]} <span className="capitalize">{selectedViolation.status}</span></div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">Data</label>
                  <p>{format(new Date(selectedViolation.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">Descrição</label>
                  <p>{selectedViolation.description || 'Sem descrição'}</p>
                </div>
              </div>
              {selectedViolation.status === 'open' && (
                <Button className="w-full" onClick={() => { setIsDetailsOpen(false); handleOpenResolve(selectedViolation); }}>
                  Resolver Violação
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Violação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notas de Resolução</label>
              <Textarea placeholder="Descreva as ações tomadas..." value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleResolve('dismissed' as ViolationStatus)} disabled={isResolving}>
              Descartar
            </Button>
            <Button onClick={() => handleResolve('resolved' as ViolationStatus)} disabled={isResolving}>
              {isResolving ? 'Salvando...' : 'Marcar como Resolvida'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { ViolationsPage };
