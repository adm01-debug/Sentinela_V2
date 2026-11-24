import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ActivitySummary } from '@/types';

export interface UseActivitySummaryOptions {
  period?: 'day' | 'week' | 'month';
  employeeId?: string;
  /** Intervalo yyyy-mm-dd; tem prioridade sobre `period` quando informado. */
  startDate?: string;
  endDate?: string;
}

export function useActivitySummary(options: UseActivitySummaryOptions = {}) {
  const { period = 'day', employeeId, startDate, endDate } = options;

  const query = useQuery({
    queryKey: ['activity-summary', period, employeeId ?? null, startDate ?? null, endDate ?? null],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('summarize-activity', {
        body: { period, employeeId, startDate, endDate },
      });
      if (error) throw error;
      return (data?.summary ?? null) as ActivitySummary | null;
    },
  });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
    refetch: query.refetch,
  };
}

export default useActivitySummary;