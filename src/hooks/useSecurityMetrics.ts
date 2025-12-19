import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export interface SecurityMetrics {
  total_violations: number;
  critical_violations: number;
  resolved_violations: number;
  pending_violations: number;
  violations_by_type: { type: string; count: number }[];
  violations_trend: { date: string; count: number }[];
  top_violators: { employee_id: string; name: string; count: number }[];
}

export function useSecurityMetrics() {
  return useQuery({
    queryKey: queryKeys.securityMetrics.overview(),
    queryFn: async () => {
      const { data: violations, error } = await supabase
        .from('security_violations')
        .select('id, severity, status, violation_type, employee_id, created_at, employee:employees(full_name)');

      if (error) throw error;

      const metrics: SecurityMetrics = {
        total_violations: violations.length,
        critical_violations: violations.filter(v => v.severity === 'critical').length,
        resolved_violations: violations.filter(v => v.status === 'resolved').length,
        pending_violations: violations.filter(v => v.status === 'pending').length,
        violations_by_type: [],
        violations_trend: [],
        top_violators: [],
      };

      // Calculate by type
      const byType: Record<string, number> = {};
      violations.forEach(v => {
        byType[v.violation_type] = (byType[v.violation_type] || 0) + 1;
      });
      metrics.violations_by_type = Object.entries(byType)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate top violators
      const byEmployee: Record<string, { name: string; count: number }> = {};
      violations.forEach(v => {
        if (!byEmployee[v.employee_id]) {
          byEmployee[v.employee_id] = { 
            name: (v.employee as any)?.full_name || 'Unknown', 
            count: 0 
          };
        }
        byEmployee[v.employee_id].count++;
      });
      metrics.top_violators = Object.entries(byEmployee)
        .map(([employee_id, data]) => ({ employee_id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return metrics;
    },
    ...queryPresets.dashboard,
  });
}
