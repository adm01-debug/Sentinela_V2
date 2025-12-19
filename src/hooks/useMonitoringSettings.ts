import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

export interface MonitoringSettings {
  id: string;
  screenshot_interval_seconds: number;
  screenshot_quality: number;
  blur_screenshots: boolean;
  track_keystrokes: boolean;
  track_applications: boolean;
  track_websites: boolean;
  track_files: boolean;
  working_hours_start: string;
  working_hours_end: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export function useMonitoringSettings() {
  return useQuery({
    queryKey: queryKeys.settings.monitoring(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitoring_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as MonitoringSettings | null;
    },
    ...queryPresets.config,
  });
}

export function useUpdateMonitoringSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: Partial<MonitoringSettings>) => {
      const { data: existing } = await supabase
        .from('monitoring_settings')
        .select('id')
        .single();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('monitoring_settings')
          .update(input)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('monitoring_settings')
          .insert(input)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return result;
    },
    onSuccess: () => {
      invalidateRelated.settings(queryClient);
      toast({ title: 'Configurações salvas' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    },
  });
}
