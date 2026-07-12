import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets } from '@/lib/queryClient';

interface ChartDataPoint { date: string; value: number; }
interface AppUsage { name: string; duration: number; category: string; }

interface RecentAlert {
  id: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  time: string;
  employee: string;
}

interface RecentActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
}

const periodDays = (period: 'day' | 'week' | 'month') =>
  period === 'day' ? 1 : period === 'week' ? 7 : 30;

const startDateISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const since = startDateISO(7);
      const prevSince = startDateISO(14);

      const [employeesRes, violationsRes, prodRes, prodPrevRes] = await Promise.all([
        supabase.from('employees').select('id, status', { count: 'exact' }),
        supabase.from('security_violations').select('id', { count: 'exact' }).eq('read', false),
        supabase
          .from('productivity_logs')
          .select('productive_time_seconds, unproductive_time_seconds, neutral_time_seconds')
          .gte('recorded_date', since),
        supabase
          .from('productivity_logs')
          .select('productive_time_seconds, unproductive_time_seconds, neutral_time_seconds')
          .gte('recorded_date', prevSince)
          .lt('recorded_date', since),
      ]);

      const employees = employeesRes.data || [];
      const activeEmployees = employees.filter((e) => e.status === 'active').length;

      const computeAvg = (rows: Array<{ productive_time_seconds: number | null; unproductive_time_seconds: number | null; neutral_time_seconds: number | null }> | null) => {
        if (!rows || rows.length === 0) return null;
        let prod = 0;
        let total = 0;
        for (const r of rows) {
          const p = r.productive_time_seconds ?? 0;
          const u = r.unproductive_time_seconds ?? 0;
          const n = r.neutral_time_seconds ?? 0;
          prod += p;
          total += p + u + n;
        }
        return total > 0 ? Math.round((prod / total) * 100) : null;
      };

      const currentAvg = computeAvg(prodRes.data);
      const prevAvg = computeAvg(prodPrevRes.data);
      const trend = currentAvg !== null && prevAvg !== null && prevAvg > 0
        ? Number((((currentAvg - prevAvg) / prevAvg) * 100).toFixed(1))
        : 0;

      return {
        totalEmployees: employeesRes.count ?? 0,
        activeEmployees,
        averageProductivity: currentAvg ?? 0,
        productivityTrend: trend,
        alertsCount: violationsRes.count ?? 0,
      };
    },
    ...queryPresets.dashboard,
  });
};

export const useRecentAlerts = (limit = 4) => {
  return useQuery<RecentAlert[]>({
    queryKey: queryKeys.dashboard.recentViolations(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('id, violation_type, severity, created_at, employee_name')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const now = Date.now();
      return data.map((v) => {
        const diff = now - new Date(v.created_at as string).getTime();
        const mins = Math.floor(diff / 60000);
        const timeLabel = mins < 1 ? 'agora' : mins < 60 ? `${mins} min atrás` : `${Math.floor(mins / 60)}h atrás`;
        return {
          id: v.id as string,
          message: (v.violation_type as string) || 'Violação detectada',
          severity: ((v.severity as RecentAlert['severity']) || 'medium'),
          time: timeLabel,
          employee: (v.employee_name as string) || 'Desconhecido',
        };
      });
    },
    ...queryPresets.dashboard,
  });
};

export const useRecentActivity = (limit = 5) => {
  return useQuery<RecentActivityItem[]>({
    queryKey: queryKeys.dashboard.recentActivity(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('id, employee_name, recorded_date, productive_time_seconds')
        .order('recorded_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((item) => ({
        id: item.id as string,
        user: (item.employee_name as string) || 'Desconhecido',
        action: `registrou ${Math.round(((item.productive_time_seconds as number) || 0) / 60)} min produtivo`,
        time: (item.recorded_date as string) || '',
      }));
    },
    ...queryPresets.dashboard,
  });
};

/**
 * Séries diárias de atividade (soma de segundos produtivos + neutros por dia).
 * Retorna valor em MINUTOS para melhor legibilidade no eixo Y.
 */
export const useActivityChart = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['activity-chart', period],
    queryFn: async () => {
      const days = periodDays(period);
      const since = startDateISO(days);
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('recorded_date, productive_time_seconds, neutral_time_seconds')
        .gte('recorded_date', since)
        .order('recorded_date', { ascending: true });

      if (error) throw error;
      const buckets = new Map<string, number>();
      // pré-popula todos os dias para manter continuidade no gráfico
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        buckets.set(d.toISOString().slice(0, 10), 0);
      }
      for (const row of data || []) {
        const key = row.recorded_date as string;
        const secs = ((row.productive_time_seconds as number) || 0) + ((row.neutral_time_seconds as number) || 0);
        buckets.set(key, (buckets.get(key) || 0) + secs);
      }
      return Array.from(buckets.entries()).map(([date, seconds]) => ({
        date,
        value: Math.round(seconds / 60),
      })) as ChartDataPoint[];
    },
    ...queryPresets.dashboard,
  });
};

/**
 * Percentual médio de produtividade por dia no período selecionado.
 */
export const useProductivityChart = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['productivity-chart', period],
    queryFn: async () => {
      const days = periodDays(period);
      const since = startDateISO(days);
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('recorded_date, productive_time_seconds, unproductive_time_seconds, neutral_time_seconds')
        .gte('recorded_date', since)
        .order('recorded_date', { ascending: true });

      if (error) throw error;
      const buckets = new Map<string, { prod: number; total: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        buckets.set(d.toISOString().slice(0, 10), { prod: 0, total: 0 });
      }
      for (const row of data || []) {
        const key = row.recorded_date as string;
        const p = (row.productive_time_seconds as number) || 0;
        const u = (row.unproductive_time_seconds as number) || 0;
        const n = (row.neutral_time_seconds as number) || 0;
        const b = buckets.get(key) || { prod: 0, total: 0 };
        b.prod += p;
        b.total += p + u + n;
        buckets.set(key, b);
      }
      return Array.from(buckets.entries()).map(([date, { prod, total }]) => ({
        date,
        value: total > 0 ? Math.round((prod / total) * 100) : 0,
      })) as ChartDataPoint[];
    },
    ...queryPresets.dashboard,
  });
};

export const useTopEmployees = (limit = 5) => {
  return useQuery({
    queryKey: ['top-employees', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    ...queryPresets.list,
  });
};

export const useTopApplications = (limit = 10) => {
  return useQuery({
    queryKey: ['top-applications', limit],
    queryFn: async () => [] as AppUsage[],
    ...queryPresets.list,
  });
};
