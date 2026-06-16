import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  type: "webhook" | "whatsapp" | "email" | "slack" | "push";
  config?: unknown;
}

export function useIntegrations() {
  const query = useQuery({
    queryKey: ["integrations-status"],
    queryFn: async (): Promise<Integration[]> => {
      const [webhooksRes, whatsappRes, alertRes] = await Promise.all([
        supabase.from("webhooks").select("id, name, url, is_active").limit(50),
        supabase
          .from("whatsapp_notification_settings")
          .select("id, phone_number_id, recipient_numbers, enabled")
          .limit(10),
        supabase.from("alert_notification_settings").select("id, setting_type, enabled").limit(10),
      ]);

      const integrations: Integration[] = [];

      for (const wh of webhooksRes.data ?? []) {
        integrations.push({
          id: wh.id,
          name: `Webhook: ${wh.name}`,
          enabled: wh.is_active ?? false,
          type: "webhook",
          config: { url: wh.url },
        });
      }

      for (const wa of whatsappRes.data ?? []) {
        const number = wa.phone_number_id ?? wa.recipient_numbers?.[0] ?? "sem número";
        integrations.push({
          id: wa.id,
          name: `WhatsApp: ${number}`,
          enabled: wa.enabled ?? false,
          type: "whatsapp",
        });
      }

      for (const an of alertRes.data ?? []) {
        integrations.push({
          id: an.id,
          name: `Email Alert: ${an.setting_type}`,
          enabled: an.enabled ?? false,
          type: "email",
        });
      }

      return integrations;
    },
    staleTime: 60_000,
  });

  const integrations = useMemo(() => query.data ?? [], [query.data]);
  const activeCount = useMemo(() => integrations.filter((i) => i.enabled).length, [integrations]);

  return {
    integrations,
    activeCount,
    totalCount: integrations.length,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
