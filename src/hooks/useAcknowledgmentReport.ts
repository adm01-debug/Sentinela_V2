import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AckViolationRow {
  id: string;
  employee_name: string;
  policy_name: string | null;
  violation_type: string | null;
  severity: string | null;
  created_at: string;
  employee_notified_at: string | null;
  employee_acknowledged_at: string | null;
  employee_ack_reason: string | null;
  employee_ack_ip: string | null;
  employee_ack_device: string | null;
}

export interface EmployeeAckStats {
  employee: string;
  total: number;
  notified: number;
  acknowledged: number;
  pending: number;
  notNotified: number;
  ackRate: number; // 0-100 (of notified)
  avgAckSeconds: number | null;
}

export interface AckReportData {
  rows: AckViolationRow[];
  perEmployee: EmployeeAckStats[];
  totals: {
    total: number;
    notified: number;
    acknowledged: number;
    pending: number;
    notNotified: number;
    ackRate: number;
    avgAckSeconds: number | null;
  };
}

interface Params {
  from: string; // ISO
  to: string; // ISO
  employee?: string | null;
}

export function useAcknowledgmentReport({ from, to, employee }: Params) {
  return useQuery<AckReportData>({
    queryKey: ['ack-report', from, to, employee ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('security_violations')
        .select(
          'id, employee_name, policy_name, violation_type, severity, created_at, employee_notified_at, employee_acknowledged_at, employee_ack_reason, employee_ack_ip, employee_ack_device',
        )
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false })
        .limit(5000);
      if (employee) q = q.eq('employee_name', employee);
      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as AckViolationRow[];

      const byEmp = new Map<string, AckViolationRow[]>();
      for (const r of rows) {
        const k = r.employee_name || '—';
        const arr = byEmp.get(k) ?? [];
        arr.push(r);
        byEmp.set(k, arr);
      }

      const perEmployee: EmployeeAckStats[] = Array.from(byEmp.entries())
        .map(([employee, list]) => {
          const total = list.length;
          const notified = list.filter((r) => r.employee_notified_at).length;
          const acknowledged = list.filter((r) => r.employee_acknowledged_at).length;
          const pending = notified - acknowledged;
          const notNotified = total - notified;
          const ackTimes = list
            .filter((r) => r.employee_notified_at && r.employee_acknowledged_at)
            .map(
              (r) =>
                (new Date(r.employee_acknowledged_at!).getTime() -
                  new Date(r.employee_notified_at!).getTime()) /
                1000,
            )
            .filter((s) => s >= 0 && s < 86400);
          const avgAckSeconds =
            ackTimes.length > 0 ? ackTimes.reduce((a, b) => a + b, 0) / ackTimes.length : null;
          return {
            employee,
            total,
            notified,
            acknowledged,
            pending,
            notNotified,
            ackRate: notified > 0 ? (acknowledged / notified) * 100 : 0,
            avgAckSeconds,
          };
        })
        .sort((a, b) => b.total - a.total);

      const total = rows.length;
      const notified = rows.filter((r) => r.employee_notified_at).length;
      const acknowledged = rows.filter((r) => r.employee_acknowledged_at).length;
      const allAckTimes = rows
        .filter((r) => r.employee_notified_at && r.employee_acknowledged_at)
        .map(
          (r) =>
            (new Date(r.employee_acknowledged_at!).getTime() -
              new Date(r.employee_notified_at!).getTime()) /
            1000,
        )
        .filter((s) => s >= 0 && s < 86400);

      return {
        rows,
        perEmployee,
        totals: {
          total,
          notified,
          acknowledged,
          pending: notified - acknowledged,
          notNotified: total - notified,
          ackRate: notified > 0 ? (acknowledged / notified) * 100 : 0,
          avgAckSeconds:
            allAckTimes.length > 0
              ? allAckTimes.reduce((a, b) => a + b, 0) / allAckTimes.length
              : null,
        },
      };
    },
  });
}

export function formatAckDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
