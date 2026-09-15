import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, queryPresets } from "@/lib/queryClient";

export interface SecurityMetrics {
  total_violations: number;
  critical_violations: number;
  resolved_violations: number;
  pending_violations: number;
  violations_by_type: { type: string; count: number }[];
  violations_trend: { date: string; count: number }[];
  top_violators: { employee_name: string; count: number }[];
}

interface ViolationRow {
  id: string;
  severity: string | null;
  status: string | null;
  violation_type: string;
  employee_name: string | null;
  created_at: string;
}

export function useSecurityMetrics() {
  return useQuery({
    queryKey: queryKeys.securityMetrics.overview(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('id, severity, status, violation_type, employee_name, created_at');

      if (error) throw error;
      const violations = (data ?? []) as unknown as ViolationRow[];

      const metrics: SecurityMetrics = {
        total_violations: violations.length,
        critical_violations: violations.filter((v) => v.severity === 'critical').length,
        resolved_violations: violations.filter((v) => v.status === 'resolved').length,
        pending_violations: violations.filter((v) => v.status === 'open').length,
        violations_by_type: [],
        violations_trend: [],
        top_violators: [],
      };

      // Calculate by type
      const byType: Record<string, number> = {};
      violations.forEach((v) => {
        byType[v.violation_type] = (byType[v.violation_type] || 0) + 1;
      });
      metrics.violations_by_type = Object.entries(byType)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate top violators
      const byEmployee: Record<string, number> = {};
      violations.forEach((v) => {
        const name = v.employee_name || 'Unknown';
        byEmployee[name] = (byEmployee[name] || 0) + 1;
      });
      metrics.top_violators = Object.entries(byEmployee)
        .map(([employee_name, count]) => ({ employee_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return metrics;
    },
    ...queryPresets.dashboard,
  });
}
