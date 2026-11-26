import { LogIn, LogOut, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGeofenceEvents } from "@/hooks/useGeofenceEvents";

function formatMoment(value: string | null) {
  if (!value) return "sem registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem registro";
  return date.toLocaleString("pt-BR");
}

function eventLabel(eventType: string) {
  if (eventType === "enter") return "Entrou";
  if (eventType === "exit") return "Saiu";
  return eventType;
}

export function GeofenceEventsPanel() {
  const { events, inside, isLoading, error, refetch } = useGeofenceEvents();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Dentro agora</CardTitle>
            <CardDescription>
              Última posição registrada de cada funcionário nas áreas monitoradas.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : inside.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum funcionário está dentro de uma área monitorada no momento.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {inside.map((state) => (
                <div
                  key={`${state.employee_id}-${state.device_id}-${state.geofence_id}`}
                  className="rounded-lg border p-3"
                >
                  <p className="text-sm font-medium">{state.employee_name}</p>
                  <p className="text-muted-foreground text-xs">{state.geofence_name}</p>
                  <p className="text-muted-foreground text-xs">
                    Verificado em {formatMoment(state.last_checked)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas entradas e saídas</CardTitle>
          <CardDescription>
            Registrado pelo aplicativo em campo sempre que o funcionário cruza o limite de uma área.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p role="alert" className="text-destructive text-sm">
              Não foi possível carregar o histórico: {error.message}
            </p>
          ) : null}
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum evento registrado ainda. O histórico aparece a partir da próxima verificação de
              posição dos funcionários.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Quando</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.employee_name}</TableCell>
                      <TableCell>{event.geofence_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={event.event_type === "enter" ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {event.event_type === "enter" ? (
                            <LogIn className="h-3 w-3" />
                          ) : (
                            <LogOut className="h-3 w-3" />
                          )}
                          {eventLabel(event.event_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {event.device_id}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatMoment(event.occurred_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default GeofenceEventsPanel;
