import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, REFETCH_INTERVALS } from '@/lib/queryClient';

export interface ActiveEmployee {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  last_activity_at?: string;
  is_online: boolean;
}

export function useActiveEmployees() {
  return useQuery({
    queryKey: queryKeys.employees.active(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, email, department, last_activity_at')
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      return data.map(emp => ({
        ...emp,
        is_online: emp.last_activity_at ? emp.last_activity_at > fiveMinutesAgo : false,
      })) as ActiveEmployee[];
    },
    ...queryPresets.realtime,
    refetchInterval: REFETCH_INTERVALS.FREQUENT,
  });
}

export function useOnlineEmployeesCount() {
  return useQuery({
    queryKey: queryKeys.employees.online(),
    queryFn: async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { count, error } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('last_activity_at', fiveMinutesAgo);

      if (error) throw error;
      return count || 0;
    },
    ...queryPresets.realtime,
  });
}
