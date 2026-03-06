import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Backward-compatible export used by UI components
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('alert_notification_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data || { enabled: true, notify_critical: true, notify_high: true, notify_medium: false, notify_low: false };
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: any) => {
      const { data, error } = await supabase.from('alert_notification_settings').upsert(settings).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); },
  });
};

export const useNotificationSettings = () => useSettings();
export const useUpdateNotificationSettings = () => useUpdateSettings();
