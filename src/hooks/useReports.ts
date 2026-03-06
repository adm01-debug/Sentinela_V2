import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReports = (filters?: any) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_analysis_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data || [], total: data?.length || 0 };
    },
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_analysis_reports').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_analysis_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); },
  });
};
