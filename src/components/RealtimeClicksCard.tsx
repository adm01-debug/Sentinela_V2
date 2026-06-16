import { MousePointer2, Clock, User, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClickLog {
  id: string;
  employee_name: string;
  click_type: string;
  x_position: number | null;
  y_position: number | null;
  app_name: string | null;
  window_title: string | null;
  url: string | null;
  device: string | null;
  recorded_at: string;
}

interface RealtimeClicksCardProps {
  clicks: ClickLog[];
}

export const RealtimeClicksCard = ({ clicks }: RealtimeClicksCardProps) => {
  const getClickTypeLabel = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      left: { label: "Esquerdo", color: "bg-blue-500/20 text-blue-400" },
      right: { label: "Direito", color: "bg-orange-500/20 text-orange-400" },
      middle: { label: "Meio", color: "bg-purple-500/20 text-purple-400" },
      double: { label: "Duplo", color: "bg-green-500/20 text-green-400" },
    };
    return types[type] || { label: type, color: "bg-muted text-muted-foreground" };
  };

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MousePointer2 className="h-5 w-5 text-primary" />
          Cliques em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {clicks.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <MousePointer2 className="mb-2 h-12 w-12 opacity-50" />
              <p>Nenhum clique registrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clicks.map((click) => {
                const clickType = getClickTypeLabel(click.click_type);
                return (
                  <div
                    key={click.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-2 transition-colors hover:bg-muted"
                  >
                    <Badge className={`${clickType.color} min-w-[70px] justify-center border-0`}>
                      {clickType.label}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">{click.employee_name}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        {click.url ? (
                          <>
                            <ExternalLink className="h-3 w-3" />
                            {click.url}
                          </>
                        ) : (
                          click.app_name || click.window_title || "Desconhecido"
                        )}
                      </div>
                    </div>
                    {click.x_position !== null && click.y_position !== null && (
                      <span className="font-mono text-xs text-muted-foreground">
                        ({click.x_position}, {click.y_position})
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(click.recorded_at), "HH:mm:ss", { locale: ptBR })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
