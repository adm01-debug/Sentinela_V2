import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeamAverageResult {
  avgProductivityScore: number;
  avgProductiveSeconds: number;
  avgNeutralSeconds: number;
  avgUnproductiveSeconds: number;
  sampleSize: number;
}

/**
 * Calcula o score médio de produtividade da equipe (todos os colaboradores)
 * em uma data específica, para comparação com o desempenho individual.
 */
export function useTeamProductivityAverage(date: string, excludeEmployeeName?: string) {
  return useQuery({
    queryKey: ['team-productivity-average', date, excludeEmployeeName ?? null],
    enabled: !!date,
    staleTime: 60_000,
    queryFn: async (): Promise<TeamAverageResult> => {
      let query = supabase
        .from('productivity_logs')
        .select('employee_name, productive_time_seconds, neutral_time_seconds, unproductive_time_seconds')
        .eq('recorded_date', date);

      if (excludeEmployeeName) {
        query = query.neq('employee_name', excludeEmployeeName);
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as Array<{
        employee_name: string;
        productive_time_seconds: number | null;
        neutral_time_seconds: number | null;
        unproductive_time_seconds: number | null;
      }>;

      // Agregar por colaborador
      const perEmployee = new Map<string, { p: number; n: number; u: number }>();
      for (const r of rows) {
        const cur = perEmployee.get(r.employee_name) ?? { p: 0, n: 0, u: 0 };
        cur.p += r.productive_time_seconds ?? 0;
        cur.n += r.neutral_time_seconds ?? 0;
        cur.u += r.unproductive_time_seconds ?? 0;
        perEmployee.set(r.employee_name, cur);
      }

      const sampleSize = perEmployee.size;
      if (sampleSize === 0) {
        return {
          avgProductivityScore: 0,
          avgProductiveSeconds: 0,
          avgNeutralSeconds: 0,
          avgUnproductiveSeconds: 0,
          sampleSize: 0,
        };
      }

      let sumP = 0, sumN = 0, sumU = 0, sumScore = 0;
      for (const { p, n, u } of perEmployee.values()) {
        sumP += p;
        sumN += n;
        sumU += u;
        const total = p + n + u;
        sumScore += total > 0 ? (p / total) * 100 : 0;
      }

      return {
        avgProductivityScore: Math.round(sumScore / sampleSize),
        avgProductiveSeconds: Math.round(sumP / sampleSize),
        avgNeutralSeconds: Math.round(sumN / sampleSize),
        avgUnproductiveSeconds: Math.round(sumU / sampleSize),
        sampleSize,
      };
    },
  });
}
