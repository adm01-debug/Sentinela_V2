import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SoundType } from "@/utils/notificationSound";

export interface SoundSettings {
  enabled: boolean;
  soundType: SoundType;
  volume: number;
  playCritical: boolean;
  playHigh: boolean;
  playMedium: boolean;
}

export interface RateLimitThresholds {
  agentCollector: {
    maxRequests: number;
    windowSeconds: number;
    alertThreshold: number;
  };
  mobileCollector: {
    maxRequests: number;
    windowSeconds: number;
    alertThreshold: number;
  };
  analyzeActivity: {
    maxRequests: number;
    windowSeconds: number;
    alertThreshold: number;
  };
  checkGeofence: {
    maxRequests: number;
    windowSeconds: number;
    alertThreshold: number;
  };
  globalAlertEnabled: boolean;
  alertCooldownMinutes: number;
  cleanup: {
    enabled: boolean;
    frequencyHours: number;
    logRetentionHours: number;
  };
  sound: SoundSettings;
}

const DEFAULT_THRESHOLDS: RateLimitThresholds = {
  agentCollector: {
    maxRequests: 100,
    windowSeconds: 60,
    alertThreshold: 10,
  },
  mobileCollector: {
    maxRequests: 60,
    windowSeconds: 60,
    alertThreshold: 10,
  },
  analyzeActivity: {
    maxRequests: 10,
    windowSeconds: 300,
    alertThreshold: 5,
  },
  checkGeofence: {
    maxRequests: 120,
    windowSeconds: 60,
    alertThreshold: 10,
  },
  globalAlertEnabled: true,
  alertCooldownMinutes: 15,
  cleanup: {
    enabled: true,
    frequencyHours: 1,
    logRetentionHours: 24,
  },
  sound: {
    enabled: true,
    soundType: 'chime',
    volume: 70,
    playCritical: true,
    playHigh: true,
    playMedium: false,
  },
};


export const useRateLimitSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['rate-limit-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitoring_settings')
        .select('*')
        .eq('setting_key', 'rate_limit_thresholds')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.setting_value) {
        return data.setting_value as unknown as RateLimitThresholds;
      }
      
      return DEFAULT_THRESHOLDS;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: RateLimitThresholds) => {
      const { data: existing } = await supabase
        .from('monitoring_settings')
        .select('id')
        .eq('setting_key', 'rate_limit_thresholds')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('monitoring_settings')
          .update({ 
            setting_value: JSON.parse(JSON.stringify(newSettings)),
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'rate_limit_thresholds');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('monitoring_settings')
          .insert([{
            setting_key: 'rate_limit_thresholds',
            setting_value: JSON.parse(JSON.stringify(newSettings)),
            description: 'Rate limiting thresholds configuration'
          }]);

        if (error) throw error;
      }

      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-limit-settings'] });
      toast.success('Configurações de rate limiting salvas');
    },
    onError: (error) => {
      console.error('Error saving rate limit settings:', error);
      toast.error('Erro ao salvar configurações');
    },
  });

  return {
    settings: settings || DEFAULT_THRESHOLDS,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
    defaultSettings: DEFAULT_THRESHOLDS,
  };
};
