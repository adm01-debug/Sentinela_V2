import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useDataExportPage } from '@/hooks/useDataExportPage';
import { ExportJobCard, ExportStats } from '@/components/export';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Download, RefreshCw, FileSpreadsheet, FileJson, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Erro ao carregar exportações</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button onClick={resetErrorBoundary} className="mt-4">Tentar novamente</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

const DataExportContent = React.memo(function DataExportContent() {
  const {
    exports,
    stats,
    selectedType,
    selectedFormat,
    isConfigOpen,
    isLoading,
    isRefreshing,
    handleTypeChange,
    handleFormatChange,
    handleOpenConfig,
    handleCloseConfig,
    handleStartExport,
    handleCancelExport,
    handleDeleteExport,
    handleDownload,
    handleRefresh,
    isExporting,
  } = useDataExportPage();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ExportStats {...stats} />

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleOpenConfig}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Exportação
        </Button>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Exportações</CardTitle>
          <CardDescription>Suas exportações recentes</CardDescription>
        </CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma exportação realizada</p>
              <Button className="mt-4" onClick={handleOpenConfig}>
                Criar primeira exportação
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {exports.map((job) => (
                <ExportJobCard
                  key={job.id}
                  job={job}
                  onDownload={handleDownload}
                  onCancel={handleCancelExport}
                  onDelete={handleDeleteExport}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Config Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={handleCloseConfig}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Exportação</DialogTitle>
            <DialogDescription>
              Configure os dados que deseja exportar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Tipo de Dados</Label>
              <RadioGroup value={selectedType} onValueChange={(v) => handleTypeChange(v as any)}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="employees" id="employees" />
                    <Label htmlFor="employees">Funcionários</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="violations" id="violations" />
                    <Label htmlFor="violations">Violações</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="activities" id="activities" />
                    <Label htmlFor="activities">Atividades</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reports" id="reports" />
                    <Label htmlFor="reports">Relatórios</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Formato</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
                  { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
                  { value: 'json', label: 'JSON', icon: FileJson },
                  { value: 'pdf', label: 'PDF', icon: FileText },
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={selectedFormat === value ? 'default' : 'outline'}
                    className="flex flex-col h-20 gap-1"
                    onClick={() => handleFormatChange(value as any)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseConfig}>
              Cancelar
            </Button>
            <Button onClick={handleStartExport} disabled={isExporting}>
              {isExporting ? 'Iniciando...' : 'Iniciar Exportação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default function DataExport() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exportação de Dados</h1>
          <p className="text-muted-foreground">
            Exporte dados do sistema em diversos formatos
          </p>
        </div>
      </div>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSkeleton />}>
          <DataExportContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
