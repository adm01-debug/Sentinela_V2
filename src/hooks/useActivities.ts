import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActivities = (filters?: any) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      let query = supabase.from('keystroke_logs').select('*').order('recorded_at', { ascending: false }).limit(100);
      if (filters?.employee_name) query = query.eq('employee_name', filters.employee_name);
      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], total: data?.length || 0 };
    },
  });
};

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('keystroke_logs').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useActivitySummary = (filters?: any) => {
  return useQuery({
    queryKey: ['activity-summary', filters],
    queryFn: async () => ({
      totalKeystrokes: 0,
      totalActiveTime: 0,
      totalIdleTime: 0,
      topApps: [] as any[],
    }),
  });
};
