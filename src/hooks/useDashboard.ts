import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChartDataPoint { date: string; value: number; }
interface AppUsage { name: string; duration: number; category: string; }

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [employeesRes, violationsRes] = await Promise.all([
        supabase.from('employees').select('id, status', { count: 'exact' }),
        supabase.from('security_violations').select('id', { count: 'exact' }),
      ]);
      const employees = employeesRes.data || [];
      const activeEmployees = employees.filter((e: Record<string, unknown>) => e.status === 'active').length;
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
