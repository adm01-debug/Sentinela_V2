import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RankingEntry {
  employeeName: string;
  productiveSeconds: number;
  neutralSeconds: number;
  unproductiveSeconds: number;
  totalSeconds: number;
  score: number; // 0-100
  activeDays: number;
}

export interface WeeklyRankingResult {
  entries: RankingEntry[];
  weekStart: string;
  weekEnd: string;
  teamAverageScore: number;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Ranking semanal de produtividade da equipe.
 * Agrega productivity_logs dos últimos N dias (default 7) e ordena por score.
 */
export function useWeeklyProductivityRanking(days = 7) {
  return useQuery({
    queryKey: ['weekly-productivity-ranking', days],
    staleTime: 60_000,
    queryFn: async (): Promise<WeeklyRankingResult> => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));
      const weekStart = toIsoDate(start);
      const weekEnd = toIsoDate(end);

      const { data, error } = await supabase
        .from('productivity_logs')
        .select('employee_name, recorded_date, productive_time_seconds, neutral_time_seconds, unproductive_time_seconds')
        .gte('recorded_date', weekStart)
        .lte('recorded_date', weekEnd);

      if (error) throw error;

      const perEmployee = new Map<string, { p: number; n: number; u: number; days: Set<string> }>();
      for (const r of (data ?? []) as Array<{
        employee_name: string;
        recorded_date: string;
        productive_time_seconds: number | null;
        neutral_time_seconds: number | null;
        unproductive_time_seconds: number | null;
      }>) {
        if (!r.employee_name) continue;
        const cur = perEmployee.get(r.employee_name) ?? { p: 0, n: 0, u: 0, days: new Set<string>() };
        cur.p += r.productive_time_seconds ?? 0;
        cur.n += r.neutral_time_seconds ?? 0;
        cur.u += r.unproductive_time_seconds ?? 0;
        cur.days.add(r.recorded_date);
        perEmployee.set(r.employee_name, cur);
      }

      const entries: RankingEntry[] = Array.from(perEmployee.entries()).map(([name, v]) => {
        const total = v.p + v.n + v.u;
        return {
          employeeName: name,
          productiveSeconds: v.p,
          neutralSeconds: v.n,
          unproductiveSeconds: v.u,
          totalSeconds: total,
          score: total > 0 ? Math.round((v.p / total) * 100) : 0,
          activeDays: v.days.size,
        };
      });

      entries.sort((a, b) => b.score - a.score || b.productiveSeconds - a.productiveSeconds);

      const teamAverageScore =
        entries.length > 0
          ? Math.round(entries.reduce((acc, e) => acc + e.score, 0) / entries.length)
          : 0;

      return { entries, weekStart, weekEnd, teamAverageScore };
    },
  });
}
