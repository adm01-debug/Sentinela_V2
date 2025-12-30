import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  type SecurityPolicy, 
  type ApplicationRule, 
  defaultPolicies, 
  defaultAppRules 
} from '@/data/settingsData';

// Re-export types for external use
export type { SecurityPolicy, ApplicationRule };

// ============================================================
// HOOKS - POLICIES
// ============================================================

function usePolicies() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>(defaultPolicies);
  
  const updatePolicy = useCallback((id: string, enabled: boolean) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled } : p));
  }, []);

  return { policies, updatePolicy };
}

// ============================================================
// HOOKS - APPLICATION RULES
// ============================================================

function useAppRules() {
  const [appRules, setAppRules] = useState<ApplicationRule[]>(defaultAppRules);
  const { toast } = useToast();

  const updateAppRule = useCallback((id: string, status: 'allowed' | 'blocked' | 'monitored') => {
    setAppRules(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  const addAppRule = useCallback((rule: Omit<ApplicationRule, 'id'>) => {
    const newRule: ApplicationRule = {
      ...rule,
      id: Date.now().toString(),
    };
    setAppRules(prev => [...prev, newRule]);
    toast({ title: 'Aplicativo adicionado' });
    return true;
  }, [toast]);

  const deleteAppRule = useCallback(async (id: string) => {
    setAppRules(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Aplicativo removido' });
    return true;
  }, [toast]);

  const editAppRule = useCallback((id: string, updates: Partial<ApplicationRule>) => {
    setAppRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    toast({ title: 'Aplicativo atualizado' });
    return true;
  }, [toast]);

  return { appRules, updateAppRule, addAppRule, deleteAppRule, editAppRule };
}

// ============================================================
// MONITORING SETTINGS
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

export function useMonitoringSettings() {
  return useQuery({
    queryKey: queryKeys.settings.monitoring(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitoring_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
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
// COMBINED SETTINGS HOOK
// ============================================================

export function useSettings() {
  const [loading] = useState(false);
  const { policies, updatePolicy } = usePolicies();
  const { appRules, updateAppRule, addAppRule, deleteAppRule, editAppRule } = useAppRules();

  return {
    policies,
    appRules,
    loading,
    updatePolicy,
    updateAppRule,
    addAppRule,
    deleteAppRule,
    editAppRule,
  };
}
