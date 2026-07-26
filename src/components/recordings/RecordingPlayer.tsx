import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Pause, Play, SkipBack, SkipForward, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlayableChunk, RecordingSession } from '@/hooks/useRecordingSessions';

interface RecordingPlayerProps {
  session: RecordingSession | null;
  chunks: PlayableChunk[];
  isLoading?: boolean;
  /** Offset (em segundos desde o início) para o qual o player deve saltar. */
  seekToOffset?: number | null;
  className?: string;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Reproduz uma sessão gravada como sequência contínua de trechos WebM.
 * Cada chunk é um arquivo independente; o player encadeia automaticamente
 * e mantém uma linha do tempo virtual em segundos absolutos da sessão.
 */
function RecordingPlayerComponent({
  session,
  chunks,
  isLoading = false,
  seekToOffset = null,
  className,
}: RecordingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localTime, setLocalTime] = useState(0);

  const totalDuration = useMemo(
    () => chunks.reduce((sum, c) => sum + (c.duration_seconds || 0), 0),
    [chunks],
  );

  const current = chunks[index] ?? null;
  const absoluteTime = (current?.offsetSeconds ?? 0) + localTime;

  /** Encontra o chunk que cobre um offset absoluto e posiciona o vídeo. */
  const seekAbsolute = useCallback(
    (offset: number) => {
      if (chunks.length === 0) return;
      const clamped = Math.min(Math.max(offset, 0), Math.max(totalDuration - 1, 0));
      let target = 0;
      for (let i = 0; i < chunks.length; i += 1) {
        const start = chunks[i].offsetSeconds;
        const end = start + (chunks[i].duration_seconds || 0);
        if (clamped >= start && clamped < end) {
          target = i;
          break;
        }
        target = i;
      }
      setIndex(target);
      const within = clamped - chunks[target].offsetSeconds;
      setLocalTime(within);
      const el = videoRef.current;
      if (el) {
        // currentTime só é aplicável após metadata; guardamos e reaplicamos no onLoadedMetadata.
        try {
          el.currentTime = within;
        } catch {
          /* metadata ainda não disponível — reaplicado em handleLoadedMetadata */
        }
      }
    },
    [chunks, totalDuration],
  );

  useEffect(() => {
    if (seekToOffset === null || seekToOffset === undefined) return;
    seekAbsolute(seekToOffset);
    setIsPlaying(true);
  }, [seekToOffset, seekAbsolute]);

  // Ao trocar de sessão, reinicia o estado do player.
  useEffect(() => {
    setIndex(0);
    setLocalTime(0);
    setIsPlaying(false);
  }, [session?.id]);

  const handleEnded = useCallback(() => {
    if (index < chunks.length - 1) {
      setIndex((prev) => prev + 1);
      setLocalTime(0);
    } else {
      setIsPlaying(false);
    }
  }, [index, chunks.length]);

  const handleLoadedMetadata = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (localTime > 0 && Math.abs(el.currentTime - localTime) > 0.5) {
      el.currentTime = localTime;
    }
    if (isPlaying) {
      void el.play().catch(() => setIsPlaying(false));
    }
  }, [isPlaying, localTime]);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      void el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <EmptyState
            icon={VideoOff}
            title="Nenhuma sessão selecionada"
            description="Escolha uma gravação na lista para iniciar a reprodução."
          />
        </CardContent>
      </Card>
    );
  }

  if (chunks.length === 0 || !current?.signedUrl) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{session.employee_name}</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <EmptyState
            icon={VideoOff}
            title="Sem trechos disponíveis"
            description={
              session.status === 'recording'
                ? 'A sessão ainda está em gravação — os trechos aparecem conforme são enviados pelo agente.'
                : 'Esta sessão não possui trechos de vídeo armazenados (expirados ou falha de envio).'
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{session.employee_name}</CardTitle>
          <p className="truncate text-sm text-muted-foreground">
            {current.app_name || current.window_title || session.device || 'Sessão gravada'}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Trecho {index + 1}/{chunks.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- gravação de tela sem trilha de áudio */}
          <video
            ref={videoRef}
            key={current.id}
            src={current.signedUrl}
            className="aspect-video w-full bg-background"
            controls={false}
            playsInline
            preload="metadata"
            onEnded={handleEnded}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={(e) => setLocalTime(e.currentTarget.currentTime)}
            aria-label={`Gravação de ${session.employee_name}`}
          />
        </div>

        <div className="space-y-2">
          <Slider
            value={[Math.min(absoluteTime, totalDuration)]}
            max={Math.max(totalDuration, 1)}
            step={1}
            onValueChange={(v) => seekAbsolute(v[0] ?? 0)}
            aria-label="Posição da reprodução"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatClock(absoluteTime)}</span>
            <span>{formatClock(totalDuration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => seekAbsolute(absoluteTime - 15)}
            aria-label="Retroceder 15 segundos"
          >
            <SkipBack className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}>
            {isPlaying ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="ml-2">{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => seekAbsolute(absoluteTime + 15)}
            aria-label="Avançar 15 segundos"
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const RecordingPlayer = memo(RecordingPlayerComponent);
