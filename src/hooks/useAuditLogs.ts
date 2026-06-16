import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, queryPresets } from "@/lib/queryClient";

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: unknown;
  created_at: string;
  user?: { email: string };
}

export function useAuditLogs(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list({ entityType, entityId }),
    queryFn: async () => {
      let query = supabase
        .from("login_security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (entityType) query = query.eq("event_type", entityType);
      if (entityId) query = query.eq("user_id", entityId);

      const { data, error } = await query;
      if (error) throw error;
      return ((data || []) as Array<Record<string, unknown>>).map(
        (row: Record<string, unknown>): AuditLog => ({
          id: String(row.id),
          user_id: String(row.user_id),
          action: String(row.event_type),
          entity_type: String(row.event_type),
          entity_id: String(row.user_id),
          changes: (row.metadata as Record<string, unknown>) || undefined,
          created_at: String(row.created_at),
        })
      );
    },
    ...queryPresets.list,
  });
}
