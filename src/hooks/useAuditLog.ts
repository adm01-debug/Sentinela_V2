import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, queryPresets } from "@/lib/queryClient";

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  old_value?: unknown | null;
  new_value?: unknown | null;
  created_at: string;
}

export function useAuditLog(filters?: {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.auditLogs.list(filters),
    queryFn: async () => {
      // Use settings_audit_log table that exists
      let queryBuilder = supabase
        .from("settings_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filters?.userId) queryBuilder = queryBuilder.eq("user_id", filters.userId);
      if (filters?.action) queryBuilder = queryBuilder.eq("action", filters.action);
      if (filters?.entityType) queryBuilder = queryBuilder.eq("entity_type", filters.entityType);
      if (filters?.startDate) queryBuilder = queryBuilder.gte("created_at", filters.startDate);
      if (filters?.endDate) queryBuilder = queryBuilder.lte("created_at", filters.endDate);

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data as AuditLogEntry[];
    },
    ...queryPresets.list,
  });

  return {
    logs: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.list(filters) }),
  };
}
