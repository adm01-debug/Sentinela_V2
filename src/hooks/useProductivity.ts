import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductivityMetric {
  date: string;
  score: number;
  activeTimeSeconds: number;
  idleTimeSeconds: number;
  keystrokesCount: number;
  employeeName: string;
}

export function useProductivity(employeeName?: string, days = 30) {
  const since = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }, [days]);

  const query = useQuery({
    queryKey: ['productivity', employeeName, days],
    queryFn: async (): Promise<ProductivityMetric[]> => {
      let q = supabase
        .from('keystroke_logs')
        .select('employee_name, recorded_at, keystrokes_count, active_time_seconds, idle_time_seconds')
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: false })
        .limit(500);

      if (employeeName) q = q.eq('employee_name', employeeName);

      const { data, error } = await q;
      if (error) throw error;

      // Aggregate by date and employee
      const grouped = new Map<string, ProductivityMetric>();

      for (const row of data ?? []) {
        const date = row.recorded_at.split('T')[0];
        const key = `${date}_${row.employee_name}`;
        const existing = grouped.get(key);

        if (existing) {
          existing.activeTimeSeconds += row.active_time_seconds || 0;
          existing.idleTimeSeconds += row.idle_time_seconds || 0;
          existing.keystrokesCount += row.keystrokes_count || 0;
          const total = existing.activeTimeSeconds + existing.idleTimeSeconds;
          existing.score = total > 0 ? Math.round((existing.activeTimeSeconds / total) * 100) : 0;
        } else {
          const active = row.active_time_seconds || 0;
          const idle = row.idle_time_seconds || 0;
          const total = active + idle;
          grouped.set(key, {
            date,
            employeeName: row.employee_name,
            activeTimeSeconds: active,
            idleTimeSeconds: idle,
            keystrokesCount: row.keystrokes_count || 0,
            score: total > 0 ? Math.round((active / total) * 100) : 0,
          });
        }
      }

      return Array.from(grouped.values()).sort((a, b) => b.date.localeCompare(a.date));
    },
    staleTime: 60_000,
  });

  const metrics = useMemo(() => query.data ?? [], [query.data]);

  const averageScore = useMemo(() => {
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length);
  }, [metrics]);

  return {
    metrics,
    averageScore,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
