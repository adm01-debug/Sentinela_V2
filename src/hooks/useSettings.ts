import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AlertNotificationSettingsInsert =
  Database["public"]["Tables"]["alert_notification_settings"]["Insert"];

export interface ApplicationRule {
  id: string;
  name: string;
  category: "productivity" | "communication" | "entertainment" | "development" | "other";
  status: "allowed" | "blocked" | "monitored";
  created_at: string;
  updated_at: string;
}

// Backward-compatible export used by UI components
export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alert_notification_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (
        data || {
          enabled: true,
          notify_critical: true,
          notify_high: true,
          notify_medium: false,
          notify_low: false,
        }
      );
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: AlertNotificationSettingsInsert) => {
      const { data, error } = await supabase
        .from("alert_notification_settings")
        .upsert(settings)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};

export const useNotificationSettings = () => useSettings();
export const useUpdateNotificationSettings = () => useUpdateSettings();
