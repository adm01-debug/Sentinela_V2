import React, { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { AlertTriangle, Search, Loader2, XCircle, CheckCircle } from 'lucide-react';

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const ViolationsContent = memo(function ViolationsContent() {
  const { t } = useTranslation();
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
      <PageHeader title={t('violations.title')} description={t('violations.subtitle')} />

      <ViolationStatsCards stats={stats} />

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder={t('common.search')} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-9" 
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('violations.severity')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="critical">{t('violations.severityCritical')}</SelectItem>
            <SelectItem value="high">{t('violations.severityHigh')}</SelectItem>
            <SelectItem value="medium">{t('violations.severityMedium')}</SelectItem>
            <SelectItem value="low">{t('violations.severityLow')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('violations.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="open">{t('violations.statusPending')}</SelectItem>
            <SelectItem value="investigating">{t('violations.statusReviewed')}</SelectItem>
            <SelectItem value="resolved">{t('violations.statusResolved')}</SelectItem>
            <SelectItem value="dismissed">{t('violations.statusDismissed')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('violations.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {VIOLATION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : violations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('violations.noViolations')}</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-3">
            {violations.map((v) => (
              <ViolationCard 
                key={v.id} 
                violation={v} 
                typeLabel={getTypeLabel(v.violation_type)} 
                onViewDetails={handleViewDetails} 
                onResolve={handleOpenResolve} 
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('common.details')}</DialogTitle>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('violations.employee')}</Label>
                  <p className="font-medium">{selectedViolation.employee_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('violations.type')}</Label>
                  <p className="font-medium">{getTypeLabel(selectedViolation.violation_type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('violations.severity')}</Label>
                  <Badge>{selectedViolation.severity}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('violations.status')}</Label>
                  <Badge>{selectedViolation.status}</Badge>
                </div>
              </div>
              {selectedViolation.description && (
                <div>
                  <Label className="text-muted-foreground">{t('violations.description')}</Label>
                  <p>{selectedViolation.description}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">{t('violations.date')}</Label>
                <p>{format(new Date(selectedViolation.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('violations.markAsResolved')}</DialogTitle>
            <DialogDescription>{t('violations.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>{t('violations.comments')}</Label>
              <Textarea 
                value={resolutionNotes} 
                onChange={(e) => setResolutionNotes(e.target.value)} 
                placeholder={t('violations.addComment')} 
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleResolve('dismissed')} disabled={isResolving}>
              <XCircle className="mr-2 h-4 w-4" />
              {t('violations.dismiss')}
            </Button>
            <Button variant="secondary" onClick={() => handleResolve('investigating')} disabled={isResolving}>
              <Search className="mr-2 h-4 w-4" />
              {t('violations.statusReviewed')}
            </Button>
            <Button onClick={() => handleResolve('resolved')} disabled={isResolving}>
              {isResolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('violations.markAsResolved')}
            </Button>
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
