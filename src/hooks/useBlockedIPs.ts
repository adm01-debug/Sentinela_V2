import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';
import { useMemo } from 'react';

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  blocked_at: string;
  expires_at: string | null;
  created_by?: string | null;
  is_active: boolean;
  endpoint?: string | null;
  request_count_at_block?: number | null;
}

export interface BlockIPInput {
  ip_address: string;
  reason?: string;
  expires_at?: string | null;
  endpoint?: string;
  request_count_at_block?: number;
}

export function useBlockedIPs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
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

  const activeBlocks = useMemo(() => {
    if (!query.data) return [];
    const now = new Date();
    return query.data.filter(b => 
      b.is_active && (!b.expires_at || new Date(b.expires_at) > now)
    );
  }, [query.data]);

  const inactiveBlocks = useMemo(() => {
    if (!query.data) return [];
    const now = new Date();
    return query.data.filter(b => 
      !b.is_active || (b.expires_at && new Date(b.expires_at) <= now)
    );
  }, [query.data]);

  const blockMutation = useMutation({
    mutationFn: async (input: BlockIPInput) => {
      const { data, error } = await supabase
        .from('blocked_ips')
        .insert({
          ip_address: input.ip_address,
          reason: input.reason || null,
          expires_at: input.expires_at || null,
          endpoint: input.endpoint || null,
          request_count_at_block: input.request_count_at_block || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.rateLimiting(queryClient);
      toast({ title: 'IP bloqueado com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao bloquear IP', description: error.message, variant: 'destructive' });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('blocked_ips')
        .update({ is_active: false })
        .eq('id', id);
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

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('blocked_ips').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.rateLimiting(queryClient);
      toast({ title: 'Registro removido' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    },
  });

  return {
    ...query,
    activeBlocks,
    inactiveBlocks,
    blockIP: blockMutation.mutate,
    unblockIP: unblockMutation.mutate,
    deleteBlock: deleteMutation.mutate,
    isBlocking: blockMutation.isPending,
  };
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
        .insert({ 
          ip_address: input.ip_address, 
          reason: input.reason,
          expires_at: blocked_until,
          is_active: true,
        })
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
    mutationFn: async (id) => {
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
