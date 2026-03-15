import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/Skeleton';
import { useAlert, useAcknowledgeAlert } from '@/hooks/useAlerts';

interface AlertData {
  id: string;
  title?: string;
  severity?: string;
  message?: string;
  description?: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  createdAt?: string;
  created_at?: string;
  employeeName?: string;
  employee_name?: string;
}

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rawAlert, isLoading } = useAlert(id!);
  const acknowledge = useAcknowledgeAlert();

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!rawAlert) return <div className="p-6">Alerta não encontrado</div>;

  const alert = rawAlert as unknown as AlertData;
  const severityColors: Record<string, string> = { low: 'bg-blue-100 text-blue-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800' };
  const createdDate = new Date(alert.createdAt || alert.created_at || '');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
          <AlertTriangle className={`h-6 w-6 ${alert.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />
          <h1 className="text-2xl font-bold">{alert.title}</h1>
          <Badge className={severityColors[alert.severity || 'medium']}>{alert.severity}</Badge>
        </div>
        {!alert.acknowledged && <Button onClick={() => acknowledge.mutate(id!)}><CheckCircle className="mr-2 h-4 w-4" />Reconhecer</Button>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{alert.message || alert.description || ''}</p>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{format(createdDate, 'dd/MM/yyyy HH:mm')}</div>
            <div className="flex items-center gap-2"><User className="h-4 w-4" />{alert.employeeName || alert.employee_name || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm"><span className="text-muted-foreground">Criado em:</span> {format(createdDate, 'dd/MM/yyyy HH:mm')}</div>
              {alert.acknowledged && alert.acknowledgedAt && <div className="text-sm"><span className="text-muted-foreground">Reconhecido em:</span> {format(new Date(alert.acknowledgedAt), 'dd/MM/yyyy HH:mm')}</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
