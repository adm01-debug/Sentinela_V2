import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, REFETCH_INTERVALS } from '@/lib/queryClient';

export interface RealtimeActivity {
  id: string;
  user_id: string | null;
  activity_type: string;
  description: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  metadata?: unknown;
  employee?: { name: string };
}

export function useRealtimeActivity(limit = 50) {
  return useQuery({
    queryKey: queryKeys.activity.realtime(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as RealtimeActivity[];
    },
    ...queryPresets.realtime,
    refetchInterval: REFETCH_INTERVALS.REALTIME,
  });
}

export function useEmployeeActivity(entityId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.activity.employee(entityId || ''),
    queryFn: async () => {
      if (!entityId) return [];

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as unknown as RealtimeActivity[];
    },
    enabled: !!entityId,
    ...queryPresets.list,
  });
}
