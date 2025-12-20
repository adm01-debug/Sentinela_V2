import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

interface SecurityEvent {
  id: string;
  type: 'login_failed' | 'mfa_disabled' | 'suspicious_activity' | 'brute_force';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id: string | null;
  ip_address: string;
  description: string;
  created_at: string;
  resolved: boolean;
}

interface SecuritySettings {
  mfa_required: boolean;
  password_min_length: number;
  session_timeout_minutes: number;
  max_login_attempts: number;
  ip_whitelist_enabled: boolean;
}

export function useSecurityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const eventsQuery = useQuery({
    queryKey: queryKeys.security.events({ severity: severityFilter, type: typeFilter }),
    queryFn: async () => {
      let query = supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(50);
      if (severityFilter !== 'all') query = query.eq('severity', severityFilter);
      if (typeFilter !== 'all') query = query.eq('type', typeFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data as SecurityEvent[];
    },
  });

  const settingsQuery = useQuery({
    queryKey: queryKeys.security.settings,
    queryFn: async () => {
      const { data, error } = await supabase.from('security_settings').select('*').single();
      if (error) throw error;
      return data as SecuritySettings;
    },
  });

  const stats = useMemo(() => {
    const events = eventsQuery.data || [];
    return {
      total: events.length,
      critical: events.filter(e => e.severity === 'critical').length,
      unresolved: events.filter(e => !e.resolved).length,
      today: events.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length,
    };
  }, [eventsQuery.data]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SecuritySettings>) => {
      const { error } = await supabase.from('security_settings').update(settings).eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.security.settings });
      toast({ title: 'Configurações atualizadas' });
    },
  });

  const resolveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from('security_events').update({ resolved: true }).eq('id', eventId);
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
    handleSeverityFilterChange: useCallback((v: string) => setSeverityFilter(v), []),
    handleTypeFilterChange: useCallback((v: string) => setTypeFilter(v), []),
    handleUpdateSettings: useCallback((s: Partial<SecuritySettings>) => updateSettingsMutation.mutate(s), [updateSettingsMutation]),
    handleResolveEvent: useCallback((id: string) => resolveEventMutation.mutate(id), [resolveEventMutation]),
    isUpdating: updateSettingsMutation.isPending,
  };
}
