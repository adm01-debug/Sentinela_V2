import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/Skeleton';
import { useReport } from '@/hooks/useReports';

interface ReportData {
  id: string;
  report_type: string;
  summary: string | null;
  analysis_period_start: string | null;
  analysis_period_end: string | null;
  generated_by: string | null;
  created_at: string;
  risk_score: number | null;
  employee_name: string | null;
  insights: unknown;
  recommendations: unknown;
  raw_data: unknown;
  // Mapped fields
  name?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  content?: string;
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading } = useReport(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!report) return <div className="p-6">Relatório não encontrado</div>;

  const r = report as ReportData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
          <h1 className="text-2xl font-bold">{r.name || r.report_type || 'Relatório'}</h1>
          <Badge variant={r.status === 'completed' ? 'default' : 'secondary'}>{r.status || 'pending'}</Badge>
        </div>
        <Button><Download className="mr-2 h-4 w-4" />Baixar</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /><span>Tipo</span></div>
            <p className="mt-2 font-medium">{r.type || r.report_type}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>Período</span></div>
            <p className="mt-2 font-medium">
              {r.startDate ? format(new Date(r.startDate), 'dd/MM/yyyy') : r.analysis_period_start ? format(new Date(r.analysis_period_start), 'dd/MM/yyyy') : '-'}
              {' - '}
              {r.endDate ? format(new Date(r.endDate), 'dd/MM/yyyy') : r.analysis_period_end ? format(new Date(r.analysis_period_end), 'dd/MM/yyyy') : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /><span>Criado por</span></div>
            <p className="mt-2 font-medium">{r.createdBy || r.generated_by || '-'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Conteúdo do Relatório</CardTitle></CardHeader>
        <CardContent>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: r.content || r.summary || '' }} />
        </CardContent>
      </Card>
    </div>
  );
}
