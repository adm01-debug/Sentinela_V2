import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

export interface AlertSettings {
  id: string;
  alert_type: string;
  is_enabled: boolean;
  channels: string[];
  threshold?: number;
  cooldown_minutes: number;
  recipients: string[];
  created_at: string;
  updated_at: string;
}

export function useAlertSettings() {
  return useQuery({
    queryKey: queryKeys.settings.alerts(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_settings')
        .select('*')
        .order('alert_type', { ascending: true });

      if (error) throw error;
      return data as AlertSettings[];
    },
    ...queryPresets.config,
  });
}

export function useUpdateAlertSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<AlertSettings>) => {
      const { data, error } = await supabase
        .from('alert_settings')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.settings(queryClient);
      toast({ title: 'Configurações de alerta atualizadas' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}
