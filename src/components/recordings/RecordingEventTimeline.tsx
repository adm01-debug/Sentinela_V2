import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Camera, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { RecordingSession, RecordingTimelineEvent } from '@/hooks/useRecordingSessions';

interface RecordingEventTimelineProps {
  session: RecordingSession | null;
  events: RecordingTimelineEvent[];
  isLoading?: boolean;
  onSeek: (offsetSeconds: number) => void;
  className?: string;
}

function severityVariant(severity: string | null): 'destructive' | 'secondary' | 'outline' {
  if (severity === 'critical' || severity === 'high') return 'destructive';
  if (severity === 'medium') return 'secondary';
  return 'outline';
}

/**
 * Correlaciona eventos (violações e capturas OCR) com a linha do tempo do vídeo,
 * permitindo saltar diretamente para o momento em que o evento ocorreu.
 */
function RecordingEventTimelineComponent({
  session,
  events,
  isLoading = false,
  onSeek,
  className,
}: RecordingEventTimelineProps) {
  const sessionStart = session ? new Date(session.started_at).getTime() : 0;

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
          Eventos correlacionados
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : !session ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Selecione uma sessão para ver os eventos.
          </p>
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum evento registrado durante esta sessão.
          </p>
        ) : (
          <ScrollArea className="h-[420px] pr-3">
            <ol className="space-y-2">
              {events.map((event) => {
                const offset = Math.max(
                  0,
                  Math.round((new Date(event.at).getTime() - sessionStart) / 1000),
                );
                const Icon = event.kind === 'violation' ? AlertTriangle : Camera;
                return (
                  <li key={event.id}>
                    <Button
                      variant="ghost"
                      onClick={() => onSeek(offset)}
                      className="h-auto w-full justify-start gap-3 rounded-lg border border-border/60 p-3 text-left hover:bg-muted/60"
                    >
                      <Icon
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          event.kind === 'violation' ? 'text-destructive' : 'text-muted-foreground',
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{event.label}</span>
                          {event.severity && (
                            <Badge variant={severityVariant(event.severity)} className="shrink-0">
                              {event.severity}
                            </Badge>
                          )}
                        </span>
                        {event.detail && (
                          <span className="line-clamp-2 block text-xs text-muted-foreground">
                            {event.detail}
                          </span>
                        )}
                        <span className="block text-xs text-muted-foreground">
                          {format(new Date(event.at), "dd/MM 'às' HH:mm:ss", { locale: ptBR })}
                        </span>
                      </span>
                    </Button>
                  </li>
                );
              })}
            </ol>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export const RecordingEventTimeline = memo(RecordingEventTimelineComponent);
