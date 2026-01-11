import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Monitor, Keyboard, Mouse, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/Skeleton';
import { useActivity } from '@/hooks/useActivities';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: activity, isLoading } = useActivity(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!activity) return <div className="p-6">Atividade não encontrada</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
        <h1 className="text-2xl font-bold">Detalhes da Atividade</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Aplicação:</span>{activity.application}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Data:</span>{format(new Date(activity.timestamp), "PPP 'às' HH:mm", { locale: ptBR })}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Duração:</span>{activity.duration} minutos</div>
            <div><span className="font-medium">Categoria:</span><Badge className="ml-2" variant={activity.category === 'productive' ? 'default' : 'secondary'}>{activity.category}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Métricas de Atividade</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2"><Keyboard className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Teclas digitadas:</span>{activity.keystrokes || 0}</div>
            <div className="flex items-center gap-2"><Mouse className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Cliques:</span>{activity.mouseClicks || 0}</div>
            <div><span className="font-medium">Título da janela:</span><p className="text-muted-foreground mt-1">{activity.windowTitle}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
