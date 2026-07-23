import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyEvent } from '@/components/timeline/DailyJourneyTimeline';

function toMinuteOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export interface DailyJourneySummary {
  productiveSeconds: number;
  neutralSeconds: number;
  unproductiveSeconds: number;
  totalSeconds: number;
  productivityScore: number; // 0-100
  topApps: Array<{ name: string; seconds: number }>;
}

export interface DailyJourneyResult {
  events: JourneyEvent[];
  summary: DailyJourneySummary;
}

/**
 * Combina presença (time_entries), violações (security_violations) e
 * resumo diário de produtividade (productivity_logs) para um colaborador
 * em um dia específico.
 */
export function useDailyJourney(employeeId: string, date: string) {
  return useQuery({
    queryKey: ['daily-journey', employeeId, date],
    enabled: !!employeeId && !!date,
    staleTime: 60_000,
    queryFn: async (): Promise<DailyJourneyResult> => {
      const dayStart = new Date(`${date}T00:00:00`).toISOString();
      const dayEnd = new Date(`${date}T23:59:59`).toISOString();

      const [entriesRes, empRes] = await Promise.all([
        supabase
          .from('time_entries')
          .select('clock_in, clock_out, duration_minutes')
          .eq('employee_id', employeeId)
          .gte('clock_in', dayStart)
          .lte('clock_in', dayEnd),
        supabase
          .from('employees')
          .select('name')
          .eq('id', employeeId)
          .maybeSingle(),
      ]);

      if (entriesRes.error) throw entriesRes.error;
      const employeeName = (empRes.data as { name?: string } | null)?.name ?? '';

      const [violationsRes, prodRes] = await Promise.all([
        employeeName
          ? supabase
              .from('security_violations')
              .select('id, violation_type, severity, created_at')
              .eq('employee_name', employeeName)
              .gte('created_at', dayStart)
              .lte('created_at', dayEnd)
          : Promise.resolve({ data: [], error: null } as const),
        employeeName
          ? supabase
              .from('productivity_logs')
              .select('productive_time_seconds, unproductive_time_seconds, neutral_time_seconds, apps_used')
              .eq('employee_name', employeeName)
              .eq('recorded_date', date)
          : Promise.resolve({ data: [], error: null } as const),
      ]);

      if (violationsRes.error) throw violationsRes.error;
      if (prodRes.error) throw prodRes.error;

      const events: JourneyEvent[] = [];

      for (const e of entriesRes.data ?? []) {
        const start = clamp(toMinuteOfDay(e.clock_in), 0, 1439);
        const end = e.clock_out
          ? clamp(toMinuteOfDay(e.clock_out), start, 1440)
          : start + (e.duration_minutes ?? 0);
        events.push({
          kind: 'presence',
          startMinute: start,
          durationMinutes: Math.max(1, end - start),
          label: 'Sessão de trabalho',
        });
      }

      for (const v of (violationsRes.data ?? []) as Array<{
        id: string;
        violation_type?: string;
        severity?: string;
        created_at: string;
      }>) {
        events.push({
          kind: 'violation',
          startMinute: toMinuteOfDay(v.created_at),
          durationMinutes: 3,
          label: `${v.violation_type ?? 'Violação'} (${v.severity ?? 'medium'})`,
          meta: { violationId: v.id },
        });
      }

      // Resumo diário agregando todos os dispositivos daquele colaborador.
      let productiveSeconds = 0;
      let neutralSeconds = 0;
      let unproductiveSeconds = 0;
      const appTotals = new Map<string, number>();

      for (const row of (prodRes.data ?? []) as Array<{
        productive_time_seconds?: number | null;
        neutral_time_seconds?: number | null;
        unproductive_time_seconds?: number | null;
        apps_used?: unknown;
      }>) {
        productiveSeconds += row.productive_time_seconds ?? 0;
        neutralSeconds += row.neutral_time_seconds ?? 0;
        unproductiveSeconds += row.unproductive_time_seconds ?? 0;

        const apps = row.apps_used;
        if (Array.isArray(apps)) {
          for (const item of apps as Array<{ name?: string; seconds?: number }>) {
            if (!item?.name) continue;
            appTotals.set(item.name, (appTotals.get(item.name) ?? 0) + (item.seconds ?? 0));
          }
        } else if (apps && typeof apps === 'object') {
          for (const [name, seconds] of Object.entries(apps as Record<string, number>)) {
            appTotals.set(name, (appTotals.get(name) ?? 0) + (typeof seconds === 'number' ? seconds : 0));
          }
        }
      }

      const totalSeconds = productiveSeconds + neutralSeconds + unproductiveSeconds;
      const productivityScore = totalSeconds > 0 ? Math.round((productiveSeconds / totalSeconds) * 100) : 0;
      const topApps = Array.from(appTotals.entries())
        .map(([name, seconds]) => ({ name, seconds }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5);

      return {
        events,
        summary: {
          productiveSeconds,
          neutralSeconds,
          unproductiveSeconds,
          totalSeconds,
          productivityScore,
          topApps,
        },
      };
    },
  });
}
