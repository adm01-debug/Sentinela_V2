import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  blocked_until?: string;
  created_by?: string;
}

export function useBlockedIPs() {
  return useQuery({
    queryKey: queryKeys.rateLimiting.blockedIPs(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (error) throw error;
      return data as BlockedIP[];
    },
    ...queryPresets.list,
  });
}

export function useBlockIP() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: { ip_address: string; reason: string; duration_hours?: number }) => {
      const blocked_until = input.duration_hours
        ? new Date(Date.now() + input.duration_hours * 60 * 60 * 1000).toISOString()
        : undefined;

      const { data, error } = await supabase
        .from('blocked_ips')
        .insert({ ...input, blocked_until })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.rateLimiting(queryClient);
      toast({ title: 'IP bloqueado' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao bloquear IP', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUnblockIP() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blocked_ips').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.rateLimiting(queryClient);
      toast({ title: 'IP desbloqueado' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao desbloquear IP', description: error.message, variant: 'destructive' });
    },
  });
}
