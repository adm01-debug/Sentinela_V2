import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';

interface DashboardStats { employees: number; violations: number; activeDevices: number; productivity: number; }
interface RecentViolation { id: string; employee_name: string; type: string; severity: string; created_at: string; }
interface ActivityItem { id: string; type: string; description: string; created_at: string; }

export function useDashboardPage() {
  const statsQuery = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const [employees, violations, devices] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('security_violations').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('devices').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('devices').select('id', { count: 'exact' }).eq('is_active', true),
      ]);
      return {
        employees: employees.count || 0,
        violations: violations.count || 0,
        activeDevices: devices.count || 0,
        productivity: 87, // Would be calculated from activity data
      };
    },
    staleTime: 60000,
  });

  const violationsQuery = useQuery({
    queryKey: queryKeys.dashboard.recentViolations(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('id, violation_type, severity, created_at, employee_name')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data || []).map((v: unknown) => ({ 
        id: v.id,
        employee_name: v.employee_name || 'N/A',
        type: v.violation_type,
        severity: v.severity,
        created_at: v.created_at
      })) as RecentViolation[];
    },
  });

  const activityQuery = useQuery({
    queryKey: queryKeys.dashboard.recentActivity(),
    queryFn: async () => {
      // Using productivity_logs as activity source since activity_logs doesn't exist
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('id, employee_name, recorded_date, productive_time_seconds')
        .order('recorded_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []).map((item: unknown) => ({
        id: item.id,
        type: 'productivity',
        description: `${item.employee_name} - ${Math.round(item.productive_time_seconds / 60)}min produtivo`,
        created_at: item.recorded_date
      })) as ActivityItem[];
    },
  });

  const chartData = useMemo(() => {
    // Generate sample chart data for the week
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days.map((day, i) => ({
      day,
      violations: Math.floor(Math.random() * 10) + 1,
      productivity: Math.floor(Math.random() * 20) + 80,
    }));
  }, []);

  return {
    stats: statsQuery.data || { employees: 0, violations: 0, activeDevices: 0, productivity: 0 },
    recentViolations: violationsQuery.data || [],
    recentActivity: activityQuery.data || [],
    chartData,
    isLoading: statsQuery.isLoading,
  };
}
