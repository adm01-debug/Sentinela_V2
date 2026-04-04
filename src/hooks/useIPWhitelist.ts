import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WhitelistedIP {
  id: string;
  ip_address: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  bypass_rate_limit: boolean;
  bypass_auth: boolean;
  allowed_endpoints: string[];
}

export interface CreateWhitelistData {
  ip_address: string;
  description?: string;
  expires_at?: string | null;
  bypass_rate_limit?: boolean;
  bypass_auth?: boolean;
  allowed_endpoints?: string[];
}

export interface UpdateWhitelistData extends Partial<CreateWhitelistData> {
  is_active?: boolean;
}

export function useWhitelistedIPs() {
  return useQuery({
    queryKey: ['whitelisted-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whitelisted_ips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WhitelistedIP[];
    },
  });
}

export function useCreateWhitelistIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWhitelistData) => {
      const { data: result, error } = await supabase
        .from('whitelisted_ips')
        .insert({
          ip_address: data.ip_address,
          description: data.description || null,
          expires_at: data.expires_at || null,
          bypass_rate_limit: data.bypass_rate_limit ?? true,
          bypass_auth: data.bypass_auth ?? false,
          allowed_endpoints: data.allowed_endpoints || [],
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitelisted-ips'] });
      toast.success('IP adicionado à whitelist');
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === '23505') {
        toast.error('Este IP já está na whitelist');
      } else {
        toast.error('Erro ao adicionar IP: ' + error.message);
      }
    },
  });
}

export function useUpdateWhitelistIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateWhitelistData) => {
      const { data: result, error } = await supabase
        .from('whitelisted_ips')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitelisted-ips'] });
      toast.success('IP atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar IP: ' + error.message);
    },
  });
}

export function useDeleteWhitelistIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('whitelisted_ips')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitelisted-ips'] });
      toast.success('IP removido da whitelist');
    },
    onError: (error) => {
      toast.error('Erro ao remover IP: ' + error.message);
    },
  });
}

export function useCheckIPWhitelist(ipAddress) {
  return useQuery({
    queryKey: ['ip-whitelist-check', ipAddress],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_ip_whitelist_info', {
        p_ip_address: ipAddress,
      });

      if (error) throw error;
      return data as {
        is_whitelisted: boolean;
        bypass_rate_limit?: boolean;
        bypass_auth?: boolean;
        allowed_endpoints?: string[];
        expires_at?: string;
        description?: string;
      };
    },
    enabled: !!ipAddress,
  });
}
