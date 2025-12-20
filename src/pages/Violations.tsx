import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useViolationsPage } from '@/hooks/useViolationsPage';
import { ViolationStatsCards, ViolationCard } from '@/components/violations';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const ViolationsContent = memo(function ViolationsContent() {
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

  const getTypeLabel = (type: string) => VIOLATION_TYPES.find(t => t.value === type)?.label || type;

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader title="Violacoes" description="Gerencie e resolva violacoes de seguranca" />

      <ViolationStatsCards stats={stats} />

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Critica</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
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
            <SelectItem value="all">Todos</SelectItem>
            {VIOLATION_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : violations.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground"><AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma violacao encontrada</p></CardContent></Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-3">
            {violations.map((v) => (
              <ViolationCard key={v.id} violation={v} typeLabel={getTypeLabel(v.violation_type)} onViewDetails={handleViewDetails} onResolve={handleOpenResolve} />
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Violacao</DialogTitle>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Funcionario</Label><p className="font-medium">{selectedViolation.employee_name}</p></div>
                <div><Label className="text-muted-foreground">Tipo</Label><p className="font-medium">{getTypeLabel(selectedViolation.violation_type)}</p></div>
                <div><Label className="text-muted-foreground">Severidade</Label><Badge>{selectedViolation.severity}</Badge></div>
                <div><Label className="text-muted-foreground">Status</Label><Badge>{selectedViolation.status}</Badge></div>
              </div>
              {selectedViolation.description && (<div><Label className="text-muted-foreground">Descricao</Label><p>{selectedViolation.description}</p></div>)}
              <div><Label className="text-muted-foreground">Data</Label><p>{format(new Date(selectedViolation.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p></div>
              {selectedViolation.resolution_notes && (<div><Label className="text-muted-foreground">Notas de Resolucao</Label><p>{selectedViolation.resolution_notes}</p></div>)}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Violacao</DialogTitle>
            <DialogDescription>Escolha como resolver esta violacao</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2"><Label>Notas de Resolucao</Label><Textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Descreva a resolucao..." /></div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleResolve('dismissed')} disabled={isResolving}><XCircle className="mr-2 h-4 w-4" />Descartar</Button>
            <Button variant="secondary" onClick={() => handleResolve('investigating')} disabled={isResolving}><Search className="mr-2 h-4 w-4" />Investigar</Button>
            <Button onClick={() => handleResolve('resolved')} disabled={isResolving}>{isResolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<CheckCircle className="mr-2 h-4 w-4" />Resolver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export default function Violations() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <ViolationsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
