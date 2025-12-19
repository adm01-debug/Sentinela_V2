import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryClient, queryKeys, queryPresets } from '@/lib/queryClient';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  module: string | null;
  description: string | null;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
}

interface FetchAuditLogsParams {
  page?: number;
  pageSize?: number;
  entityType?: string;
  action?: string;
  userId?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

async function fetchAuditLogs(params: FetchAuditLogsParams = {}) {
  const {
    page = 1,
    pageSize = 50,
    entityType,
    action,
    userId,
    severity,
    startDate,
    endDate,
  } = params;

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (entityType) query = query.eq('entity_type', entityType);
  if (action) query = query.eq('action', action);
  if (userId) query = query.eq('user_id', userId);
  if (severity) query = query.eq('severity', severity);
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    logs: data as AuditLog[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export function useAuditLogs(params: FetchAuditLogsParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => fetchAuditLogs(params),
    ...queryPresets.list,
  });
}

// Hook para criar log manual (para ações que não têm trigger)
export function useCreateAuditLog() {
  return useMutation({
    mutationFn: async (log: {
      action: string;
      entityType: string;
      entityId?: string;
      entityName?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      module?: string;
      description?: string;
      severity?: 'info' | 'warning' | 'critical';
    }) => {
      const { data, error } = await supabase.rpc('create_audit_log', {
        p_action: log.action,
        p_entity_type: log.entityType,
        p_entity_id: log.entityId || null,
        p_entity_name: log.entityName || null,
        p_old_values: log.oldValues || null,
        p_new_values: log.newValues || null,
        p_module: log.module || null,
        p_description: log.description || null,
        p_severity: log.severity || 'info',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

// Helper para formatar ação
export const formatAction = (action: string): string => {
  const actions: Record<string, string> = {
    create: 'Criou',
    update: 'Atualizou',
    delete: 'Excluiu',
    view: 'Visualizou',
    export: 'Exportou',
    login: 'Logou',
    logout: 'Deslogou',
  };
  return actions[action] || action;
};

// Helper para formatar tipo de entidade
export const formatEntityType = (type: string): string => {
  const types: Record<string, string> = {
    employees: 'Funcionário',
    teams: 'Equipe',
    violation_rules: 'Regra de Violação',
    work_schedules: 'Jornada de Trabalho',
    geofences: 'Geofence',
    webhooks: 'Webhook',
    settings: 'Configuração',
    user_roles: 'Role de Usuário',
  };
  return types[type] || type;
};
