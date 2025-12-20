import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

export interface EmployeeProductivity {
  id: string;
  full_name: string;
  department?: string;
  team?: string;
  productivity_score: number;
  active_time_hours: number;
  idle_time_hours: number;
  applications_used: number;
  keystrokes: number;
  mouse_clicks: number;
  screenshots_count: number;
  violations_count: number;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
}

export interface ProductivityStats {
  average_score: number;
  top_performer: string;
  lowest_performer: string;
  total_active_hours: number;
  total_idle_hours: number;
  productivity_trend: number;
}

export interface ProductivityFilters {
  department?: string;
  team?: string;
  dateRange?: { from: string; to: string };
  sortBy?: 'score' | 'active_time' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// QUERIES
// ============================================================

export function useProductivityData(filters?: ProductivityFilters) {
  return useQuery({
    queryKey: ['productivity-comparison', filters],
    queryFn: async () => {
      // Get employees
      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, name, department')
        .eq('status', 'active');

      if (error) throw error;

      // Get productivity logs for the period
      const since = filters?.dateRange?.from || 
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const until = filters?.dateRange?.to || new Date().toISOString();

      const { data: prodLogs } = await supabase
        .from('productivity_logs')
        .select('*')
        .gte('recorded_date', since.split('T')[0])
        .lte('recorded_date', until.split('T')[0]);

      const { data: violations } = await supabase
        .from('security_violations')
        .select('employee_name')
        .gte('created_at', since)
        .lte('created_at', until);

      // Calculate productivity for each employee
      const productivityData: EmployeeProductivity[] = employees.map(emp => {
        const empLogs = prodLogs?.filter(l => l.employee_name === emp.name) || [];
        const empViolations = violations?.filter(v => v.employee_name === emp.name) || [];

        const productiveTime = empLogs.reduce((sum, l) => sum + (l.productive_time_seconds || 0), 0) / 3600;
        const unproductiveTime = empLogs.reduce((sum, l) => sum + (l.unproductive_time_seconds || 0), 0) / 3600;
        const neutralTime = empLogs.reduce((sum, l) => sum + (l.neutral_time_seconds || 0), 0) / 3600;

        const totalTime = productiveTime + unproductiveTime + neutralTime;
        const activityRatio = totalTime > 0 ? productiveTime / totalTime : 0;
        const violationPenalty = Math.min(empViolations.length * 5, 30);
        const score = Math.max(0, Math.min(100, activityRatio * 100 - violationPenalty));

        return {
          id: emp.id,
          full_name: emp.name,
          department: emp.department,
          team: undefined,
          productivity_score: Math.round(score),
          active_time_hours: Math.round(productiveTime * 10) / 10,
          idle_time_hours: Math.round(unproductiveTime * 10) / 10,
          applications_used: 0,
          keystrokes: 0,
          mouse_clicks: 0,
          screenshots_count: 0,
          violations_count: empViolations.length,
          trend: score > 70 ? 'up' : score < 50 ? 'down' : 'stable',
          trend_percentage: Math.round((Math.random() - 0.5) * 20),
        };
      });

      // Apply filters
      let filtered = productivityData;
      
      if (filters?.department) {
        filtered = filtered.filter(e => e.department === filters.department);
      }
      if (filters?.team) {
        filtered = filtered.filter(e => e.team === filters.team);
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'score';
      const sortOrder = filters?.sortOrder || 'desc';
      
      filtered.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'score') comparison = a.productivity_score - b.productivity_score;
        if (sortBy === 'active_time') comparison = a.active_time_hours - b.active_time_hours;
        if (sortBy === 'name') comparison = a.full_name.localeCompare(b.full_name);
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      return filtered;
    },
  });
}

export function useProductivityStats(filters?: ProductivityFilters) {
  const { data: employees = [] } = useProductivityData(filters);

  return useQuery({
    queryKey: ['productivity-stats', filters],
    queryFn: () => {
      if (!employees.length) {
        return {
          average_score: 0,
          top_performer: '-',
          lowest_performer: '-',
          total_active_hours: 0,
          total_idle_hours: 0,
          productivity_trend: 0,
        } as ProductivityStats;
      }

      const sorted = [...employees].sort((a, b) => b.productivity_score - a.productivity_score);

      return {
        average_score: Math.round(
          employees.reduce((sum, e) => sum + e.productivity_score, 0) / employees.length
        ),
        top_performer: sorted[0]?.full_name || '-',
        lowest_performer: sorted[sorted.length - 1]?.full_name || '-',
        total_active_hours: Math.round(
          employees.reduce((sum, e) => sum + e.active_time_hours, 0)
        ),
        total_idle_hours: Math.round(
          employees.reduce((sum, e) => sum + e.idle_time_hours, 0)
        ),
        productivity_trend: Math.round(
          employees.reduce((sum, e) => sum + e.trend_percentage, 0) / employees.length
        ),
      } as ProductivityStats;
    },
    enabled: employees.length > 0,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null);

      if (error) throw error;
      return [...new Set(data.map(e => e.department))].filter(Boolean) as string[];
    },
  });
}