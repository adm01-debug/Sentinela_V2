import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, REFETCH_INTERVALS } from '@/lib/queryClient';

export interface RealtimeActivity {
  id: string;
  employee_id: string;
  activity_type: string;
  application_name?: string;
  window_title?: string;
  url?: string;
  keystroke_count?: number;
  mouse_clicks?: number;
  created_at: string;
  employee?: { full_name: string };
}

export function useRealtimeActivity(limit = 50) {
  return useQuery({
    queryKey: queryKeys.activity.realtime(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, employee:employees(full_name)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as RealtimeActivity[];
    },
    ...queryPresets.realtime,
    refetchInterval: REFETCH_INTERVALS.REALTIME,
  });
}

export function useEmployeeActivity(employeeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.activity.employee(employeeId || ''),
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as RealtimeActivity[];
    },
    enabled: !!employeeId,
    ...queryPresets.list,
  });
}
