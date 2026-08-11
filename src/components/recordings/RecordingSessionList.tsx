import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/EmptyState';
import { Video } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { RecordingSession, RecordingStatus } from '@/hooks/useRecordingSessions';

interface RecordingSessionListProps {
  sessions: RecordingSession[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (session: RecordingSession) => void;
  className?: string;
}

const statusLabel: Record<RecordingStatus, string> = {
  recording: 'Gravando',
  completed: 'Concluída',
  failed: 'Falhou',
  expired: 'Expirada',
};

function statusVariant(status: RecordingStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'recording') return 'default';
  if (status === 'failed') return 'destructive';
  if (status === 'expired') return 'outline';
  return 'secondary';
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}min ${s}s` : `${s}s`;
}

function RecordingSessionListComponent({
  sessions,
  selectedId,
  isLoading = false,
  onSelect,
  className,
}: RecordingSessionListProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle className="text-base">Sessões gravadas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Video}
            title="Nenhuma gravação encontrada"
            description="Ajuste os filtros ou aguarde o envio de novas sessões pelos agentes."
          />
        ) : (
          <ScrollArea className="h-[420px] pr-3">
            <ul className="space-y-2">
              {sessions.map((session) => {
                const isActive = session.id === selectedId;
                return (
                  <li key={session.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(session)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'border-primary bg-primary/5'
                          : 'border-border/60 hover:bg-muted/60',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-sm font-medium">{session.employee_name}</span>
                        <Badge variant={statusVariant(session.status)} className="shrink-0">
                          {statusLabel[session.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(session.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        {' · '}
                        {formatDuration(session.duration_seconds)}
                        {' · '}
                        {session.chunk_count} trecho{session.chunk_count === 1 ? '' : 's'}
                      </p>
                      {session.device && (
                        <p className="truncate text-xs text-muted-foreground">{session.device}</p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export const RecordingSessionList = memo(RecordingSessionListComponent);
