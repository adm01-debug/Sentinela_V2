import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

interface SecurityEvent {
  id: string;
  violation_type: string;
  severity: string;
  employee_name: string;
  policy_name: string;
  description: string | null;
  created_at: string;
  read: boolean;
  device: string | null;
  ip_address: string | null;
}

interface SecuritySettings {
  mfa_required: boolean;
  ip_whitelist_enabled: boolean;
}

export function useSecurityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Use security_violations table that exists
  const eventsQuery = useQuery({
    queryKey: queryKeys.security.events({ severity: severityFilter, type: typeFilter }),
    queryFn: async () => {
      let query = supabase
        .from('security_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('violation_type', typeFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SecurityEvent[];
    },
  });

  // Use monitoring_settings for security settings
  const settingsQuery = useQuery({
    queryKey: queryKeys.security.settings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitoring_settings')
        .select('*')
        .in('setting_key', ['mfa_required', 'ip_whitelist_enabled']);
      
      if (error) throw error;
      
      const settings: SecuritySettings = {
        mfa_required: data?.find((s) => s.setting_key === 'mfa_required')?.setting_value === true,
        ip_whitelist_enabled: data?.find((s) => s.setting_key === 'ip_whitelist_enabled')?.setting_value === true,
      };
      return settings;
    },
  });

  const stats = useMemo(() => {
    const events = eventsQuery.data || [];
    return {
      total: events.length,
      critical: events.filter(e => e.severity === 'critical').length,
      unresolved: events.filter(e => !e.read).length,
      today: events.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length,
    };
  }, [eventsQuery.data]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SecuritySettings>) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('monitoring_settings')
          .upsert(update, { onConflict: 'setting_key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.security.settings });
      toast({ title: 'Configurações atualizadas' });
    },
  });

  const resolveEventMutation = useMutation({
    mutationFn: async (eventId) => {
      const { error } = await supabase
        .from('security_violations')
        .update({ read: true })
        .eq('id', eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.security.events() });
      toast({ title: 'Evento resolvido' });
    },
  });

  return {
    events: eventsQuery.data || [],
    settings: settingsQuery.data,
    stats,
    severityFilter,
    typeFilter,
    isLoading: eventsQuery.isLoading,
    handleSeverityFilterChange: useCallback((v) => setSeverityFilter(v), []),
    handleTypeFilterChange: useCallback((v) => setTypeFilter(v), []),
    handleUpdateSettings: useCallback((s: Partial<SecuritySettings>) => updateSettingsMutation.mutate(s), [updateSettingsMutation]),
    handleResolveEvent: useCallback((id: string) => resolveEventMutation.mutate(id: string), [resolveEventMutation]),
    isUpdating: updateSettingsMutation.isPending,
  };
}
