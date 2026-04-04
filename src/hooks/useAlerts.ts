import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAlerts = (filters?: { severity?: string; acknowledged?: boolean }) => {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      let query = supabase.from('security_violations').select('*').order('created_at', { ascending: false }).limit(100);
      if (filters?.severity) query = query.eq('severity', filters.severity);
      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], total: data?.length || 0 };
    },
  });
};

export const useAlert = (id) => {
  return useQuery({
    queryKey: ['alert', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('security_violations').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('security_violations').update({ status: 'acknowledged' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); },
  });
};

export const useAcknowledgeAllAlerts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('security_violations').update({ status: 'acknowledged' }).neq('status', 'acknowledged');
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); },
  });
};

export const useAlertRules = () => {
  return useQuery({
    queryKey: ['alert-rules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('application_rules').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};
