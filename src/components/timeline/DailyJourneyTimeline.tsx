import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Coffee, Image, LogIn } from 'lucide-react';

export interface JourneyEvent {
  kind: 'presence' | 'application' | 'idle' | 'violation' | 'screenshot';
  startMinute: number; // minutes from 00:00
  durationMinutes: number;
  label: string;
  meta?: { screenshotId?: string; violationId?: string };
}

interface Props {
  date: string; // yyyy-mm-dd
  events: JourneyEvent[];
  onScreenshotClick?: (id: string) => void;
  onViolationClick?: (id: string) => void;
}

const LANES: Array<{
  kind: JourneyEvent['kind'];
  label: string;
  color: string;
  icon: typeof Activity;
}> = [
  { kind: 'presence', label: 'Presença', color: 'bg-success', icon: LogIn },
  { kind: 'application', label: 'Aplicações', color: 'bg-primary', icon: Activity },
  { kind: 'idle', label: 'Ociosidade', color: 'bg-muted-foreground', icon: Coffee },
  { kind: 'violation', label: 'Violações', color: 'bg-destructive', icon: AlertTriangle },
  { kind: 'screenshot', label: 'Screenshots', color: 'bg-info', icon: Image },
];

const TOTAL_MINUTES = 24 * 60;

export function DailyJourneyTimeline({ date, events, onScreenshotClick, onViolationClick }: Props) {
  const byLane = useMemo(() => {
    const m = new Map<JourneyEvent['kind'], JourneyEvent[]>();
    for (const lane of LANES) m.set(lane.kind, []);
    for (const e of events) m.get(e.kind)?.push(e);
    return m;
  }, [events]);

  const hourMarks = Array.from({ length: 25 }, (_, i) => i);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jornada do Dia — {new Date(date).toLocaleDateString('pt-BR')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[720px] space-y-3">
            {/* Hour axis */}
            <div className="relative h-6 border-b border-border ml-32">
              {hourMarks.map((h) => (
                <div
                  key={h}
                  className="absolute top-0 text-[10px] text-muted-foreground -translate-x-1/2"
                  style={{ left: `${(h / 24) * 100}%` }}
                >
                  {String(h).padStart(2, '0')}h
                </div>
              ))}
            </div>

            {LANES.map((lane) => {
              const Icon = lane.icon;
              const laneEvents = byLane.get(lane.kind) ?? [];
              return (
                <div key={lane.kind} className="flex items-center gap-2">
                  <div className="w-32 flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {lane.label}
                  </div>
                  <div
                    className="relative flex-1 h-8 rounded bg-muted/40"
                    role="list"
                    aria-label={`Faixa ${lane.label}`}
                  >
                    {laneEvents.map((e, idx) => {
                      const left = (e.startMinute / TOTAL_MINUTES) * 100;
                      const width = Math.max(0.3, (e.durationMinutes / TOTAL_MINUTES) * 100);
                      const clickable =
                        (lane.kind === 'screenshot' && e.meta?.screenshotId && onScreenshotClick) ||
                        (lane.kind === 'violation' && e.meta?.violationId && onViolationClick);
                      const handle = () => {
                        if (lane.kind === 'screenshot' && e.meta?.screenshotId) onScreenshotClick?.(e.meta.screenshotId);
                        if (lane.kind === 'violation' && e.meta?.violationId) onViolationClick?.(e.meta.violationId);
                      };
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={clickable ? handle : undefined}
                          disabled={!clickable}
                          className={`absolute top-1 bottom-1 rounded ${lane.color} opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                            clickable ? 'cursor-pointer' : 'cursor-default'
                          }`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={`${e.label} (${e.durationMinutes}min)`}
                          aria-label={`${lane.label}: ${e.label}, duração ${e.durationMinutes} minutos`}
                          role="listitem"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
