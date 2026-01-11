import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/Skeleton';
import { useAlert, useAcknowledgeAlert } from '@/hooks/useAlerts';

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: alert, isLoading } = useAlert(id!);
  const acknowledge = useAcknowledgeAlert();

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!alert) return <div className="p-6">Alerta não encontrado</div>;

  const severityColors = { low: 'bg-blue-100 text-blue-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
          <AlertTriangle className={`h-6 w-6 ${alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
          <h1 className="text-2xl font-bold">{alert.title}</h1>
          <Badge className={severityColors[alert.severity]}>{alert.severity}</Badge>
        </div>
        {!alert.acknowledged && <Button onClick={() => acknowledge.mutate(id!)}><CheckCircle className="mr-2 h-4 w-4" />Reconhecer</Button>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{alert.description}</p>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm')}</div>
            <div className="flex items-center gap-2"><User className="h-4 w-4" />{alert.employeeName}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm"><span className="text-muted-foreground">Criado em:</span> {format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm')}</div>
              {alert.acknowledged && <div className="text-sm"><span className="text-muted-foreground">Reconhecido em:</span> {format(new Date(alert.acknowledgedAt), 'dd/MM/yyyy HH:mm')}</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}