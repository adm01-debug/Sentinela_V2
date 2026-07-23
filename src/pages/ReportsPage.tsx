import { useReports, useReportTemplates } from '@/hooks/useReports';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, FileText, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { XlsxExportButton } from '@/components/exports/XlsxExportButton';


interface ReportItem {
  id: string;
  name?: string;
  report_type?: string;
  status?: string;
  created_at?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  processing: 'secondary',
  completed: 'default',
  failed: 'destructive',
};

export const ReportsPage = () => {
  const navigate = useNavigate();
  const { data: reportsData, isLoading, isError, error } = useReports();
  const { data: templates } = useReportTemplates();

  const reports: ReportItem[] = Array.isArray(reportsData)
    ? reportsData
    : (reportsData as { data?: ReportItem[] })?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Gere e visualize relatórios detalhados de atividades e produtividade."
        showBackButton={false}
        actions={
          <div className="flex gap-2">
            <XlsxExportButton
              filename="relatorios"
              sheets={[{
                name: 'Relatórios',
                rows: reports.map(r => ({
                  Nome: r.name || r.report_type || 'Sem título',
                  Tipo: r.report_type ?? '',
                  Status: STATUS_LABEL[r.status ?? 'pending'] ?? r.status ?? '',
                  'Criado em': r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : '',
                })),
              }]}
              disabled={reports.length === 0}
            />
            <Button onClick={() => navigate('/reports/custom')} className="gap-2 h-9">
              <Plus className="h-4 w-4" />
              Novo Relatório
            </Button>
          </div>
        }

      />

      {isLoading ? (
        <div className="flex justify-center py-12" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="sr-only">Carregando relatórios…</span>
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <AlertCircle className="h-10 w-10 mx-auto text-destructive" />
            <p className="font-medium">Não foi possível carregar os relatórios</p>
            <p className="text-sm text-muted-foreground">
              {(error as Error)?.message || 'Tente novamente em alguns instantes.'}
            </p>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="font-medium">Nenhum relatório ainda</p>
              <p className="text-sm text-muted-foreground">Crie seu primeiro relatório personalizado.</p>
            </div>
            <Button onClick={() => navigate('/reports/custom')} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Relatório
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const status = report.status || 'pending';
            return (
              <Card
                key={report.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/reports/${report.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/reports/${report.id}`);
                  }
                }}
                className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{report.name || report.report_type || 'Relatório sem título'}</p>
                    {report.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[status] ?? 'outline'}>
                    {STATUS_LABEL[status] ?? status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
