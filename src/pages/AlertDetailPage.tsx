import { useParams } from 'react-router-dom';
import { Clock, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
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
  const { data: rawAlert, isLoading } = useAlert(id!);
  const acknowledge = useAcknowledgeAlert();

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!rawAlert) return <div className="p-6">Alerta não encontrado</div>;

  const alert = rawAlert as unknown as AlertData;
  const severityColors: Record<string, string> = { low: 'bg-primary/10 text-primary', medium: 'bg-warning/10 text-warning', high: 'bg-warning/15 text-warning', critical: 'bg-destructive/10 text-destructive' };
  const createdDate = new Date(alert.createdAt || alert.created_at || '');

  return (
    <div className="space-y-6">
      <PageHeader 
        title={alert.title || 'Alerta'} 
        showBackButton={true}
        actions={
          <div className="flex items-center gap-2">
            <Badge className={severityColors[alert.severity || 'medium']}>{alert.severity}</Badge>
            {!alert.acknowledged && (
              <Button onClick={() => acknowledge.mutate(id!)} className="h-9 gap-2">
                <CheckCircle className="h-4 w-4" />Reconhecer
              </Button>
            )}
          </div>
        }
      />


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
