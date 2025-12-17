import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  created_at: string;
}

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLogs((data || []).map(item => ({
        ...item,
        old_value: item.old_value as Record<string, any> | null,
        new_value: item.new_value as Record<string, any> | null,
      })));
    } catch (error: any) {
      console.error('Error fetching audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const logChange = async (params: {
    action: string;
    entityType: string;
    entityId: string;
    entityName: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('settings_audit_log')
        .insert({
          user_id: user.id,
          user_email: user.email || 'unknown',
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId,
          entity_name: params.entityName,
          old_value: params.oldValue || null,
          new_value: params.newValue || null,
        });

      if (error) throw error;

      // Refresh logs
      fetchLogs();
    } catch (error: any) {
      console.error('Error logging change:', error);
    }
  };

  return {
    logs,
    loading,
    logChange,
    refetch: fetchLogs
  };
}
