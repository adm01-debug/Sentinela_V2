import { useMemo, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clapperboard, HardDrive, TimerReset } from 'lucide-react';
import { RecordingSessionList } from '@/components/recordings/RecordingSessionList';
import { RecordingPlayer } from '@/components/recordings/RecordingPlayer';
import { RecordingEventTimeline } from '@/components/recordings/RecordingEventTimeline';
import { RecordingStorageCostCard } from '@/components/recordings/RecordingStorageCostCard';

import {
  useRecordingChunks,
  useRecordingSessions,
  useRecordingTimeline,
  type RecordingSession,
  type RecordingStatus,
} from '@/hooks/useRecordingSessions';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours >= 1 ? `${hours.toFixed(1)} h` : `${Math.round(seconds / 60)} min`;
}

export default function SessionRecordingsPage() {
  const [employeeName, setEmployeeName] = useState('');
  const [status, setStatus] = useState<RecordingStatus | 'all'>('all');
  const [selected, setSelected] = useState<RecordingSession | null>(null);
  const [seekToOffset, setSeekToOffset] = useState<number | null>(null);

  const { sessions, stats, isLoading, refetch } = useRecordingSessions({
    employeeName: employeeName || undefined,
    status,
  });

  const activeSession = useMemo(() => {
    if (!selected) return sessions[0] ?? null;
    return sessions.find((s) => s.id === selected.id) ?? selected;
  }, [selected, sessions]);

  const { chunks, isLoading: chunksLoading } = useRecordingChunks(activeSession?.id ?? null);
  const { events, isLoading: eventsLoading } = useRecordingTimeline(activeSession);

  const handleSelect = (session: RecordingSession) => {
    setSelected(session);
    setSeekToOffset(null);
  };

  return (
    <PageLayout
      title="Gravações de Sessão"
      subtitle="Playback histórico das sessões monitoradas, com eventos correlacionados"
      actions={
        <Button variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Atualizar
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clapperboard className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Sessões listadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <TimerReset className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold">{formatHours(stats.totalSeconds)}</p>
              <p className="text-xs text-muted-foreground">Tempo gravado</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <HardDrive className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold">{formatBytes(stats.totalBytes)}</p>
              <p className="text-xs text-muted-foreground">Armazenamento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clapperboard className="h-5 w-5 text-destructive" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold">{stats.failed}</p>
              <p className="text-xs text-muted-foreground">Sessões com falha</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="recording-employee">Colaborador</Label>
            <Input
              id="recording-employee"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Buscar por nome"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recording-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as RecordingStatus | 'all')}>
              <SelectTrigger id="recording-status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="recording">Gravando</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="failed">Com falha</SelectItem>
                <SelectItem value="expired">Expiradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <RecordingSessionList
          sessions={sessions}
          selectedId={activeSession?.id ?? null}
          isLoading={isLoading}
          onSelect={handleSelect}
        />
        <RecordingPlayer
          session={activeSession}
          chunks={chunks}
          isLoading={chunksLoading}
          seekToOffset={seekToOffset}
          className="lg:col-span-2"
        />
      </div>

      <RecordingEventTimeline
        session={activeSession}
        events={events}
        isLoading={eventsLoading}
        onSeek={(offset) => setSeekToOffset(offset)}
      />

      <RecordingStorageCostCard />

    </PageLayout>
  );
}
