import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: Record<string, unknown>;
  created_at: string;
  user?: { email: string };
}

export function useAuditLogs(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list({ entityType, entityId }),
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*, user:users(email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (entityType) query = query.eq('entity_type', entityType);
      if (entityId) query = query.eq('entity_id', entityId);

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
    ...queryPresets.list,
  });
}
