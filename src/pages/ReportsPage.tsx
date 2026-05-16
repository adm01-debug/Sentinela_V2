import { useReports, useReportTemplates } from '@/hooks/useReports';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ReportItem {
  id: string;
  name?: string;
  report_type?: string;
  status?: string;
}

export const ReportsPage = () => {
  const navigate = useNavigate();
  const { data: reportsData, isLoading } = useReports();
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
          <Button onClick={() => navigate('/reports/custom')} className="gap-2 h-9">
            <Plus className="h-4 w-4" />
            Novo Relatório
          </Button>
        }
      />
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <p className="font-medium">{report.name || report.report_type}</p>
                <p className="text-sm text-muted-foreground">{report.status}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
