import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

export interface OvertimeRequest {
  id: string;
  employee_id: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  created_at: string;
  employee?: { full_name: string };
}

export function useOvertimeNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.overtime(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('overtime_requests')
        .select('*, employee:employees(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OvertimeRequest[];
    },
    ...queryPresets.list,
  });
}

export function useApproveOvertime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('overtime_requests')
        .update({ status: 'approved', approved_by: user?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.notifications(queryClient);
      toast({ title: 'Hora extra aprovada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao aprovar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRejectOvertime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('overtime_requests')
        .update({ status: 'rejected', approved_by: user?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.notifications(queryClient);
      toast({ title: 'Hora extra rejeitada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao rejeitar', description: error.message, variant: 'destructive' });
    },
  });
}
