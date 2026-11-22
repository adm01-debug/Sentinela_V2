import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, REFETCH_INTERVALS } from '@/lib/queryClient';

type RealtimePreset = { staleTime?: number; gcTime?: number; refetchInterval?: number };
const realtimePreset = (queryPresets as { realtime?: RealtimePreset }).realtime ?? {};

export interface ActiveEmployee {
  id: string;
  name: string;
  email: string;
  department?: string;
  last_activity_at?: string;
  is_online: boolean;
}

// A coluna de atividade não vive em employees e sim em employee_status.
const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function useActiveEmployees() {
  return useQuery({
    queryKey: queryKeys.employees.active(),
    queryFn: async () => {
      const [employeesResult, statusResult] = await Promise.all([
        supabase
          .from('employees')
          .select('id, name, email, department, status')
          .eq('status', 'active'),
        supabase.from('employee_status').select('employee_id, last_activity_at'),
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (statusResult.error) throw statusResult.error;

      const lastActivity = new Map<string, string>();
      for (const row of statusResult.data ?? []) {
        if (row.last_activity_at) lastActivity.set(row.employee_id, row.last_activity_at);
      }

      const cutoff = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();

      return (employeesResult.data ?? [])
        .map((emp) => ({
          ...emp,
          last_activity_at: lastActivity.get(emp.id),
          is_online: (lastActivity.get(emp.id) ?? '') > cutoff,
        }))
        .sort((a, b) => (b.last_activity_at ?? '').localeCompare(a.last_activity_at ?? '')) as ActiveEmployee[];
    },
    ...realtimePreset,
    refetchInterval: REFETCH_INTERVALS.FREQUENT,
  });
}

export function useOnlineEmployeesCount() {
  return useQuery({
    queryKey: queryKeys.employees.online(),
    queryFn: async () => {
      const cutoff = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();

      const { count, error } = await supabase
        .from('employee_status')
        .select('employee_id', { count: 'exact', head: true })
        .eq('status', 'online')
        .gte('last_activity_at', cutoff);

      if (error) throw error;
      return count || 0;
    },
    ...realtimePreset,
  });
}
