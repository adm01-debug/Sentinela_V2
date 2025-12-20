import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { useReportsPage } from '@/hooks/useReportsPage';
import { ReportStats, ReportCard } from '@/components/reports';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText } from 'lucide-react';

function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6 text-center">
        <Button onClick={resetErrorBoundary}>{t('common.refresh')}</Button>
      </CardContent>
    </Card>
  );
}

const ReportsContent = React.memo(function ReportsContent() {
  const { t } = useTranslation();
  const { 
    reports, stats, typeFilter, isGenerateOpen, selectedType, isLoading, 
    setTypeFilter, setIsGenerateOpen, setSelectedType, handleGenerate, handleDelete, handleDownload, isGenerating 
  } = useReportsPage();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportStats {...stats} />
      
      <div className="flex gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('reports.reportType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="productivity">{t('reports.productivity')}</SelectItem>
            <SelectItem value="violations">{t('reports.violations')}</SelectItem>
            <SelectItem value="attendance">{t('reports.activity')}</SelectItem>
            <SelectItem value="summary">{t('reports.summary')}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsGenerateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('reports.generate')}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('reports.noReports')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map(r => (
            <ReportCard key={r.id} report={r} onDownload={handleDownload} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reports.generate')}</DialogTitle>
          </DialogHeader>
          <RadioGroup value={selectedType} onValueChange={(v) => setSelectedType(v as any)} className="space-y-2">
            {['productivity', 'violations', 'attendance', 'summary'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={type} />
                <Label htmlFor={type}>{t(`reports.${type}`)}</Label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? t('reports.generating') : t('reports.generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default function Reports() {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
        <p className="text-muted-foreground">{t('reports.subtitle')}</p>
      </div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <ReportsContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
