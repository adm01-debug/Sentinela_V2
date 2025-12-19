import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: { email: string; full_name?: string };
}

export function useAuditLog(filters?: {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*, user:users(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters?.userId) query = query.eq('user_id', filters.userId);
      if (filters?.action) query = query.eq('action', filters.action);
      if (filters?.entityType) query = query.eq('entity_type', filters.entityType);
      if (filters?.startDate) query = query.gte('created_at', filters.startDate);
      if (filters?.endDate) query = query.lte('created_at', filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLogEntry[];
    },
    ...queryPresets.list,
  });
}
