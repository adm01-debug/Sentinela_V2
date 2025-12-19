import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface RateLimitSettings {
  id: string;
  endpoint: string;
  max_requests: number;
  window_seconds: number;
  block_duration_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateRateLimitSettingsInput {
  id: string;
  max_requests?: number;
  window_seconds?: number;
  block_duration_seconds?: number;
  is_active?: boolean;
}

// ============================================================
// QUERIES
// ============================================================

export function useRateLimitSettings() {
  return useQuery({
    queryKey: queryKeys.rateLimiting.settings(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_settings')
        .select('*')
        .order('endpoint', { ascending: true });

      if (error) throw error;
      return data as RateLimitSettings[];
    },
    ...queryPresets.config,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useUpdateRateLimitSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateRateLimitSettingsInput) => {
      const { data, error } = await supabase
        .from('rate_limit_settings')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.rateLimiting(queryClient);
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações de rate limit foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar configurações',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleRateLimitSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('rate_limit_settings')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      invalidateRelated.rateLimiting(queryClient);
      toast({
        title: data.is_active ? 'Rate limit ativado' : 'Rate limit desativado',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
