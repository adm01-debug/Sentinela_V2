import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [employeesRes, violationsRes] = await Promise.all([
        supabase.from('employees').select('id, status', { count: 'exact' }),
        supabase.from('security_violations').select('id', { count: 'exact' }),
      ]);
      const employees = employeesRes.data || [];
      const activeEmployees = employees.filter((e) => e.status === 'active').length;
      return {
        totalEmployees: employeesRes.count || 0,
        activeEmployees,
        averageProductivity: 0,
        productivityTrend: 0,
        alertsCount: violationsRes.count || 0,
      };
    },
    refetchInterval: 30000,
  });
};

export const useRecentAlerts = (limit = 4) => {
  return useQuery<RecentAlert[]>({
    queryKey: ['dashboard-recent-alerts', limit],
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
        const diff = now - new Date(v.created_at).getTime();
        const mins = Math.floor(diff / 60000);
        const timeLabel = mins < 1 ? 'agora' : mins < 60 ? `${mins} min atrás` : `${Math.floor(mins / 60)}h atrás`;
        return {
          id: v.id,
          message: v.violation_type || 'Violação detectada',
          severity: (v.severity as RecentAlert['severity']) || 'medium',
          time: timeLabel,
          employee: v.employee_name || 'Desconhecido',
        };
      });
    },
    refetchInterval: 30000,
  });
};

export const useRecentActivity = (limit = 5) => {
  return useQuery<RecentActivityItem[]>({
    queryKey: ['dashboard-recent-activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('id, employee_name, recorded_date, productive_time_seconds')
        .order('recorded_date', { ascending: false })
        .limit(limit);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((item) => ({
        id: item.id,
        user: item.employee_name || 'Desconhecido',
        action: `registrou ${Math.round((item.productive_time_seconds || 0) / 60)} min produtivo`,
        time: item.recorded_date || '',
      }));
    },
    refetchInterval: 30000,
  });
};

export const useActivityChart = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['activity-chart', period],
    queryFn: async () => [] as ChartDataPoint[],
  });
};

export const useProductivityChart = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['productivity-chart', period],
    queryFn: async () => [] as ChartDataPoint[],
  });
};

export const useTopEmployees = (limit = 5) => {
  return useQuery({
    queryKey: ['top-employees', limit],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('*').eq('status', 'active').limit(limit);
      if (error) throw error;
      return data || [];
    },
  });
};

export const useTopApplications = (limit = 10) => {
  return useQuery({
    queryKey: ['top-applications', limit],
    queryFn: async () => [] as AppUsage[],
  });
};
