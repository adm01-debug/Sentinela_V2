import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// TYPES
// ============================================================

export interface MonitoringSettings {
  id?: string;
  company_id?: string;
  screenshot_interval: number;
  screenshot_quality: number;
  blur_screenshots: boolean;
  track_keystrokes: boolean;
  track_mouse_clicks: boolean;
  track_applications: boolean;
  track_websites: boolean;
  track_idle_time: boolean;
  idle_threshold_minutes: number;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AlertSettings {
  id?: string;
  company_id?: string;
  email_alerts: boolean;
  whatsapp_alerts: boolean;
  alert_on_violation: boolean;
  alert_on_idle: boolean;
  alert_on_overtime: boolean;
  alert_recipients: string[];
  escalation_enabled: boolean;
  escalation_delay_minutes: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

async function fetchMonitoringSettings(): Promise<MonitoringSettings | null> {
  const { data, error } = await supabase
    .from('monitoring_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

async function fetchAlertSettings(): Promise<AlertSettings | null> {
  const { data, error } = await supabase
    .from('alert_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

// ============================================================
// HOOKS - MONITORING SETTINGS
// ============================================================

export function useMonitoringSettings() {
  return useQuery({
    queryKey: queryKeys.settings.monitoring,
    queryFn: fetchMonitoringSettings,
    ...queryPresets.config,
  });
}

export function useUpdateMonitoringSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<MonitoringSettings>) => {
      const { data: existing } = await supabase
        .from('monitoring_settings')
        .select('id')
        .single();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('monitoring_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('monitoring_settings')
          .insert(settings)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      invalidateRelated.settings(queryClient);
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de monitoramento foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================
// HOOKS - ALERT SETTINGS
// ============================================================

export function useAlertSettings() {
  return useQuery({
    queryKey: queryKeys.settings.alerts,
    queryFn: fetchAlertSettings,
    ...queryPresets.config,
  });
}

export function useUpdateAlertSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<AlertSettings>) => {
      const { data: existing } = await supabase
        .from('alert_settings')
        .select('id')
        .single();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('alert_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('alert_settings')
          .insert(settings)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      invalidateRelated.settings(queryClient);
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de alertas foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================
// HOOKS - COMBINED SETTINGS
// ============================================================

export function useSettings() {
  const monitoring = useMonitoringSettings();
  const alerts = useAlertSettings();

  return {
    monitoring: monitoring.data,
    alerts: alerts.data,
    isLoading: monitoring.isLoading || alerts.isLoading,
    isError: monitoring.isError || alerts.isError,
    error: monitoring.error || alerts.error,
    refetch: () => {
      monitoring.refetch();
      alerts.refetch();
    },
  };
}
