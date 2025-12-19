import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  blocked_by: string | null;
  blocked_at: string;
  expires_at: string | null;
  is_active: boolean;
  request_count_at_block: number | null;
  endpoint: string | null;
  created_at: string;
}

export interface BlockIPInput {
  ip_address: string;
  reason?: string;
  expires_at?: string | null;
  request_count_at_block?: number;
  endpoint?: string;
}

export const useBlockedIPs = () => {
  const queryClient = useQueryClient();

  const { data: blockedIPs, isLoading } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (error) throw error;
      return data as BlockedIP[];
    },
  });

  const blockIP = useMutation({
    mutationFn: async (input: BlockIPInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('blocked_ips')
        .insert([{
          ip_address: input.ip_address.trim(),
          reason: input.reason || null,
          expires_at: input.expires_at || null,
          request_count_at_block: input.request_count_at_block || null,
          endpoint: input.endpoint || null,
          blocked_by: user?.id || null,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP bloqueado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Error blocking IP:', error);
      if (error.message.includes('unique')) {
        toast.error('Este IP já está bloqueado');
      } else {
        toast.error('Erro ao bloquear IP');
      }
    },
  });

  const unblockIP = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blocked_ips')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP desbloqueado com sucesso');
    },
    onError: (error) => {
      console.error('Error unblocking IP:', error);
      toast.error('Erro ao desbloquear IP');
    },
  });

  const deleteBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('Registro removido');
    },
    onError: (error) => {
      console.error('Error deleting block:', error);
      toast.error('Erro ao remover registro');
    },
  });

  const activeBlocks = blockedIPs?.filter(ip => ip.is_active) || [];
  const inactiveBlocks = blockedIPs?.filter(ip => !ip.is_active) || [];

  return {
    blockedIPs: blockedIPs || [],
    activeBlocks,
    inactiveBlocks,
    isLoading,
    blockIP: blockIP.mutate,
    unblockIP: unblockIP.mutate,
    deleteBlock: deleteBlock.mutate,
    isBlocking: blockIP.isPending,
    isUnblocking: unblockIP.isPending,
  };
};
