import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DISPUTE_SLA_HOURS } from './useDisputeMetrics';

export interface DisputeSlaAlert {
  id: string;
  violation_id: string;
  category: string | null;
  status: string;
  created_at: string;
  hoursOpen: number;
  hoursUntilBreach: number;
  severity: 'warning' | 'critical' | 'breached';
}

const WARNING_THRESHOLD_HOURS = 12; // <=12h remaining => warning
const CRITICAL_THRESHOLD_HOURS = 4; // <=4h remaining => critical

export const useDisputeSlaAlerts = () => {
  return useQuery<DisputeSlaAlert[]>({
    queryKey: ['dispute-sla-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_disputes')
        .select('id, violation_id, category, status, created_at')
        .in('status', ['pending', 'under_review'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      const now = Date.now();
      return (data ?? [])
        .map((r) => {
          const hoursOpen = (now - new Date(r.created_at).getTime()) / 3_600_000;
          const hoursUntilBreach = DISPUTE_SLA_HOURS - hoursOpen;
          let severity: DisputeSlaAlert['severity'] | null = null;
          if (hoursUntilBreach <= 0) severity = 'breached';
          else if (hoursUntilBreach <= CRITICAL_THRESHOLD_HOURS) severity = 'critical';
          else if (hoursUntilBreach <= WARNING_THRESHOLD_HOURS) severity = 'warning';
          if (!severity) return null;
          return {
            id: r.id,
            violation_id: r.violation_id,
            category: r.category,
            status: r.status,
            created_at: r.created_at,
            hoursOpen: Math.round(hoursOpen * 10) / 10,
            hoursUntilBreach: Math.round(hoursUntilBreach * 10) / 10,
            severity,
          } satisfies DisputeSlaAlert;
        })
        .filter((x): x is DisputeSlaAlert => x !== null)
        .sort((a, b) => a.hoursUntilBreach - b.hoursUntilBreach);
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
};
