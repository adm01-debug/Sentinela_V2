import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

export function useGeofenceDashboardStats() {
  return useQuery({
    queryKey: ['geofence-dashboard-stats'],
    queryFn: async () => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

      const { data: violations, error } = await supabase
        .from('geofence_violations')
        .select('*')
        .gte('created_at', subMonths(now, 1).toISOString());

      if (error) throw error;

      // Violations by Day (this week)
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const violationsByDay = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        return {
          date: format(day, 'EEE', { locale: ptBR }),
          fullDate: dayStr,
          count: (violations || []).filter(v => v.created_at.startsWith(dayStr)).length
        };
      });

      // Top Problematic Employees
      const employeeCounts: Record<string, number> = {};
      (violations || []).forEach(v => {
        employeeCounts[v.employee_name] = (employeeCounts[v.employee_name] || 0) + 1;
      });
      const topEmployees = Object.entries(employeeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top Problematic Devices
      const deviceCounts: Record<string, number> = {};
      (violations || []).forEach(v => {
        deviceCounts[v.device] = (deviceCounts[v.device] || 0) + 1;
      });
      const topDevices = Object.entries(deviceCounts)
        .map(([model, count]) => ({ model, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        violationsByDay,
        topEmployees,
        topDevices,
        totalMonthly: (violations || []).length
      };
    }
  });
}
