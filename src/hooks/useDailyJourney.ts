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

/**
 * Constrói eventos reais de jornada para um colaborador em um dia específico,
 * combinando presença (time_entries) e violações (security_violations).
 */
export function useDailyJourney(employeeId: string, date: string) {
  return useQuery({
    queryKey: ['daily-journey', employeeId, date],
    enabled: !!employeeId && !!date,
    staleTime: 60_000,
    queryFn: async (): Promise<JourneyEvent[]> => {
      const dayStart = new Date(`${date}T00:00:00`).toISOString();
      const dayEnd = new Date(`${date}T23:59:59`).toISOString();

      const [entriesRes, violationsRes, empRes] = await Promise.all([
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
        supabase
          .from('employees')
          .select('name')
          .eq('id', employeeId)
          .maybeSingle(),
      ]);

      if (entriesRes.error) throw entriesRes.error;
      const employeeName = (empRes.data as { name?: string } | null)?.name ?? '';

      const violationsRes2 = employeeName
        ? await supabase
            .from('security_violations')
            .select('id, violation_type, severity, created_at')
            .eq('employee_name', employeeName)
            .gte('created_at', dayStart)
            .lte('created_at', dayEnd)
        : { data: [], error: null };

      if (violationsRes2.error) throw violationsRes2.error;

      const events: JourneyEvent[] = [];

      for (const e of entriesRes.data ?? []) {
        const start = clamp(toMinuteOfDay(e.clock_in), 0, 1439);
        const end = e.clock_out ? clamp(toMinuteOfDay(e.clock_out), start, 1440) : start + (e.duration_minutes ?? 0);
        events.push({
          kind: 'presence',
          startMinute: start,
          durationMinutes: Math.max(1, end - start),
          label: `Sessão de trabalho`,
        });
      }

      for (const v of (violationsRes2.data ?? []) as Array<{
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

      return events;
    },
  });
}
