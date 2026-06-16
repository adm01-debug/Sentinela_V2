import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Monitor, Keyboard, Mouse, Calendar } from "lucide-react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivity } from "@/hooks/useActivities";

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: activity, isLoading } = useActivity(id!);

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );
  if (!activity) return <div className="p-6">Atividade não encontrada</div>;

  const timestamp = new Date(activity.timestamp);
  const formattedDate = isValid(timestamp)
    ? format(timestamp, "PPP 'às' HH:mm", { locale: ptBR })
    : "Data indisponível";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Atividade</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Aplicação:</span>
              {activity.application || "N/A"}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data:</span>
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Duração:</span>
              {Math.round((activity.duration || 0) / 60)} minutos
            </div>
            <div>
              <span className="font-medium">Produtivo:</span>
              <Badge className="ml-2" variant={activity.productive ? "default" : "secondary"}>
                {activity.productive ? "Sim" : "Não"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Teclas digitadas:</span>
              {activity.keystrokes || 0}
            </div>
            <div className="flex items-center gap-2">
              <Mouse className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Título:</span>
              {activity.title || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
