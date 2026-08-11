import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/Skeleton';
import {
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  MapPin,
  Monitor,
  Shield,
  Target,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Props {
  violationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Janela em minutos ao redor da violação. Default 30. */
  windowMinutes?: number;
}

interface ViolationRow {
  id: string;
  employee_name: string | null;
  policy_name: string | null;
  violation_type: string | null;
  severity: string | null;
  description: string | null;
  device: string | null;
  ip_address: string | null;
  created_at: string;
  screenshot_url: string | null;
  location: string | null;
  status: string | null;
  resolution_notes: string | null;
}

interface CaptureRow {
  id: string;
  captured_at: string;
  capture_url: string | null;
  app_name: string | null;
  window_title: string | null;
  extracted_text: string | null;
}

interface RelatedViolationRow {
  id: string;
  created_at: string;
  violation_type: string | null;
  severity: string | null;
  description: string | null;
  policy_name: string | null;
}

type TimelineEvent =
  | {
      kind: 'violation-main';
      at: string;
      violation: ViolationRow;
    }
  | {
      kind: 'violation-related';
      at: string;
      violation: RelatedViolationRow;
    }
  | {
      kind: 'capture';
      at: string;
      capture: CaptureRow;
    };

const severityTone: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/15 text-warning',
  high: 'bg-destructive/15 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

function formatTime(iso: string) {
  return format(new Date(iso), 'HH:mm:ss', { locale: ptBR });
}

function formatFull(iso: string) {
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
}

function offsetLabel(anchor: string, at: string) {
  const a = new Date(anchor).getTime();
  const b = new Date(at).getTime();
  if (a === b) return 'evento central';
  const dist = formatDistanceStrict(new Date(b), new Date(a), { locale: ptBR });
  return b > a ? `+${dist}` : `−${dist}`;
}

/**
 * Timeline detalhada de uma violação: sequência cronológica de screenshots,
 * violações correlatas do mesmo colaborador e evidências ao redor do evento.
 */
export function ViolationTimelineDialog({
  violationId,
  open,
  onOpenChange,
  windowMinutes = 30,
}: Props) {
  const [selectedCapture, setSelectedCapture] = useState<CaptureRow | null>(null);

  const violationQuery = useQuery({
    queryKey: ['violation-timeline', 'main', violationId],
    enabled: !!violationId && open,
    staleTime: 60_000,
    queryFn: async (): Promise<ViolationRow | null> => {
      if (!violationId) return null;
      const { data, error } = await supabase
        .from('security_violations')
        .select(
          'id, employee_name, policy_name, violation_type, severity, description, device, ip_address, created_at, screenshot_url, location, status, resolution_notes',
        )
        .eq('id', violationId)
        .maybeSingle();
      if (error) throw error;
      return (data as ViolationRow | null) ?? null;
    },
  });

  const main = violationQuery.data;
  const employeeName = main?.employee_name ?? null;
  const anchor = main?.created_at ?? null;

  const correlationQuery = useQuery({
    queryKey: ['violation-timeline', 'correlations', violationId, employeeName, anchor, windowMinutes],
    enabled: !!main && !!employeeName && !!anchor && open,
    staleTime: 60_000,
    queryFn: async () => {
      const anchorDate = new Date(anchor as string);
      const start = new Date(anchorDate.getTime() - windowMinutes * 60_000).toISOString();
      const end = new Date(anchorDate.getTime() + windowMinutes * 60_000).toISOString();

      const [capsRes, relRes] = await Promise.all([
        supabase
          .from('screen_captures')
          .select('id, captured_at, capture_url, app_name, window_title, extracted_text')
          .eq('employee_name', employeeName as string)
          .gte('captured_at', start)
          .lte('captured_at', end)
          .order('captured_at', { ascending: true })
          .limit(50),
        supabase
          .from('security_violations')
          .select('id, created_at, violation_type, severity, description, policy_name')
          .eq('employee_name', employeeName as string)
          .neq('id', violationId as string)
          .gte('created_at', start)
          .lte('created_at', end)
          .order('created_at', { ascending: true })
          .limit(50),
      ]);
      if (capsRes.error) throw capsRes.error;
      if (relRes.error) throw relRes.error;

      return {
        captures: (capsRes.data ?? []) as CaptureRow[],
        related: (relRes.data ?? []) as RelatedViolationRow[],
      };
    },
  });

  const events: TimelineEvent[] = useMemo(() => {
    if (!main) return [];
    const list: TimelineEvent[] = [{ kind: 'violation-main', at: main.created_at, violation: main }];
    for (const c of correlationQuery.data?.captures ?? []) {
      list.push({ kind: 'capture', at: c.captured_at, capture: c });
    }
    for (const v of correlationQuery.data?.related ?? []) {
      list.push({ kind: 'violation-related', at: v.created_at, violation: v });
    }
    list.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    return list;
  }, [main, correlationQuery.data]);

  const isLoading = violationQuery.isLoading || (!!main && correlationQuery.isLoading);
  const captureCount = correlationQuery.data?.captures.length ?? 0;
  const relatedCount = correlationQuery.data?.related.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-destructive" />
            Timeline da violação
          </DialogTitle>
          <DialogDescription>
            Sequência cronológica de eventos e evidências ao redor do incidente (±{windowMinutes} min).
          </DialogDescription>
        </DialogHeader>

        {isLoading && !main ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !main ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Violação não encontrada.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-5">
            {/* Header meta */}
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={severityTone[main.severity ?? 'medium'] ?? severityTone.medium}>
                  {main.severity ?? 'medium'}
                </Badge>
                {main.status && <Badge variant="outline">{main.status}</Badge>}
                {main.violation_type && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" /> {main.violation_type}
                  </Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatFull(main.created_at)}
                </span>
              </div>
              {main.policy_name && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Política violada: </span>
                  <span className="font-medium text-foreground">{main.policy_name}</span>
                </div>
              )}
              <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                {main.employee_name && (
                  <div>
                    <div className="uppercase tracking-wide">Colaborador</div>
                    <div className="text-foreground font-medium">{main.employee_name}</div>
                  </div>
                )}
                {main.device && (
                  <div className="flex items-start gap-1.5">
                    <Monitor className="h-3.5 w-3.5 mt-0.5" />
                    <div>
                      <div className="uppercase tracking-wide">Dispositivo</div>
                      <div className="text-foreground font-medium">{main.device}</div>
                    </div>
                  </div>
                )}
                {main.ip_address && (
                  <div>
                    <div className="uppercase tracking-wide">IP</div>
                    <div className="font-mono text-foreground">{main.ip_address}</div>
                  </div>
                )}
                {main.location && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 mt-0.5" />
                    <div>
                      <div className="uppercase tracking-wide">Localização</div>
                      <div className="text-foreground font-medium">{main.location}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo correlações */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatChip icon={Camera} label="Screenshots" value={captureCount} tone="primary" />
              <StatChip icon={AlertTriangle} label="Violações correlatas" value={relatedCount} tone="destructive" />
              <StatChip icon={Clock} label="Janela" value={`±${windowMinutes}m`} tone="muted" />
              <StatChip icon={Target} label="Eventos" value={events.length} tone="success" />
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden />
              <ol className="space-y-3">
                {events.map((ev, idx) => (
                  <TimelineItem
                    key={`${ev.kind}-${idx}-${ev.at}`}
                    event={ev}
                    anchor={main.created_at}
                    onOpenCapture={(c) => setSelectedCapture(c)}
                  />
                ))}
              </ol>
            </div>

            {main.resolution_notes && (
              <div className="rounded-md border border-success/30 bg-success/5 p-3">
                <div className="text-xs font-medium text-success">Notas de resolução</div>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {main.resolution_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Screenshot expandido inline */}
        {selectedCapture && (
          <Dialog open={!!selectedCapture} onOpenChange={(o) => !o && setSelectedCapture(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Camera className="h-4 w-4 text-primary" />
                  {selectedCapture.app_name ?? 'Captura de tela'}
                </DialogTitle>
                <DialogDescription>
                  {formatFull(selectedCapture.captured_at)}
                  {selectedCapture.window_title ? ` — ${selectedCapture.window_title}` : ''}
                </DialogDescription>
              </DialogHeader>
              {selectedCapture.capture_url ? (
                <img
                  src={selectedCapture.capture_url}
                  alt={`Captura ${selectedCapture.app_name ?? ''}`}
                  className="w-full max-h-[65vh] object-contain rounded border bg-muted"
                  loading="lazy"
                />
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Captura indisponível.
                </div>
              )}
              {selectedCapture.extracted_text && (
                <div className="rounded border bg-muted/30 p-3 text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                  <div className="font-medium text-foreground mb-1">OCR</div>
                  {selectedCapture.extracted_text}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Camera;
  label: string;
  value: number | string;
  tone: 'primary' | 'destructive' | 'muted' | 'success';
}) {
  const toneClass =
    tone === 'primary'
      ? 'text-primary'
      : tone === 'destructive'
        ? 'text-destructive'
        : tone === 'success'
          ? 'text-success'
          : 'text-muted-foreground';
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
      <Icon className={cn('h-4 w-4', toneClass)} />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function TimelineItem({
  event,
  anchor,
  onOpenCapture,
}: {
  event: TimelineEvent;
  anchor: string;
  onOpenCapture: (c: CaptureRow) => void;
}) {
  const time = formatTime(event.at);
  const offset = offsetLabel(anchor, event.at);

  if (event.kind === 'violation-main') {
    return (
      <li className="relative pl-10">
        <span className="absolute left-2 top-2 h-5 w-5 rounded-full bg-destructive ring-4 ring-destructive/20 flex items-center justify-center">
          <Target className="h-3 w-3 text-destructive-foreground" />
        </span>
        <div className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-foreground">
              {event.violation.violation_type ?? 'Violação'}
            </div>
            <span className="text-xs font-mono text-muted-foreground">{time} · {offset}</span>
          </div>
          {event.violation.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {event.violation.description}
            </p>
          )}
          {event.violation.screenshot_url && (
            <a
              href={event.violation.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ImageIcon className="h-3 w-3" /> Ver screenshot da violação
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </li>
    );
  }

  if (event.kind === 'violation-related') {
    return (
      <li className="relative pl-10">
        <span className="absolute left-2 top-2 h-5 w-5 rounded-full bg-warning ring-4 ring-warning/20 flex items-center justify-center">
          <AlertTriangle className="h-3 w-3 text-warning-foreground" />
        </span>
        <div className="rounded-lg border bg-warning/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium text-foreground">
              Violação correlata: {event.violation.violation_type ?? 'evento'}
            </div>
            <span className="text-xs font-mono text-muted-foreground">{time} · {offset}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {event.violation.severity && (
              <Badge className={severityTone[event.violation.severity] ?? severityTone.medium}>
                {event.violation.severity}
              </Badge>
            )}
            {event.violation.policy_name && (
              <span className="text-muted-foreground">{event.violation.policy_name}</span>
            )}
          </div>
          {event.violation.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {event.violation.description}
            </p>
          )}
        </div>
      </li>
    );
  }

  // capture
  const cap = event.capture;
  return (
    <li className="relative pl-10">
      <span className="absolute left-2 top-2 h-5 w-5 rounded-full bg-primary ring-4 ring-primary/15 flex items-center justify-center">
        <Camera className="h-3 w-3 text-primary-foreground" />
      </span>
      <div className="rounded-lg border bg-card p-3 flex gap-3">
        {cap.capture_url ? (
          <button
            type="button"
            onClick={() => onOpenCapture(cap)}
            className="shrink-0 rounded overflow-hidden border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Ampliar captura"
          >
            <img
              src={cap.capture_url}
              alt={cap.app_name ?? 'Captura'}
              className="h-16 w-24 object-cover"
              loading="lazy"
            />
          </button>
        ) : (
          <div className="h-16 w-24 shrink-0 rounded border bg-muted flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium text-foreground truncate">
              {cap.app_name ?? 'Captura de tela'}
            </div>
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              {time} · {offset}
            </span>
          </div>
          {cap.window_title && (
            <div className="text-xs text-muted-foreground truncate">{cap.window_title}</div>
          )}
          {cap.extracted_text && (
            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {cap.extracted_text}
            </div>
          )}
          {cap.capture_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenCapture(cap)}
              className="mt-1 h-6 px-2 text-xs"
            >
              Ampliar
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
