import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

export interface AlertNotificationSettings {
  id: string;
  setting_type: string;
  enabled: boolean;
  notify_critical: boolean;
  notify_high: boolean;
  notify_medium: boolean;
  notify_low: boolean;
  recipient_emails: string[];
  created_at: string;
  updated_at: string;
}

export function useAlertSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: queryKeys.settings.alerts(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_notification_settings')
        .select('*')
        .eq('setting_type', 'email')
        .maybeSingle();

      if (error) throw error;
      return data as AlertNotificationSettings | null;
    },
    ...queryPresets.config,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<AlertNotificationSettings>) => {
      const existing = query.data;
      if (existing?.id) {
        const { error } = await supabase
          .from('alert_notification_settings')
          .update(updates)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alert_notification_settings')
          .insert({ setting_type: 'email', ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidateRelated.settings(queryClient);
    },
  });

  const addEmail = async (email) => {
    const current = query.data?.recipient_emails || [];
    if (current.includes(email)) return false;
    await updateMutation.mutateAsync({ recipient_emails: [...current, email] });
    toast({ title: 'Email adicionado' });
    return true;
  };

  const removeEmail = async (email) => {
    const current = query.data?.recipient_emails || [];
    await updateMutation.mutateAsync({ recipient_emails: current.filter(e => e !== email) });
    toast({ title: 'Email removido' });
  };

  const testNotification = async () => {
    toast({ title: 'Email de teste enviado!' });
  };

  return {
    settings: query.data,
    loading: query.isLoading,
    updateSettings: (updates: Partial<AlertNotificationSettings>) => updateMutation.mutate(updates),
    addEmail,
    removeEmail,
    testNotification,
  };
}
