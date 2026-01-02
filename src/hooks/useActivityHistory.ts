// ============================================================
// ACTIVITY HISTORY HOOK
// Histórico de atividades e auditoria de entidades
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseReady } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

export type ActivityType =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'archive'
  | 'view'
  | 'export'
  | 'import'
  | 'share'
  | 'comment'
  | 'assign'
  | 'status_change'
  | 'custom';

export interface ActivityRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  activity_type: ActivityType;
  description: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  user_id: string;
  user?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface UseActivityHistoryOptions {
  entityType: string;
  entityId?: string;
  limit?: number;
  activityTypes?: ActivityType[];
}

// ============================================================
// MOCK DATA
// ============================================================

const mockActivities: ActivityRecord[] = [
  {
    id: 'mock-1',
    entity_type: 'default',
    entity_id: 'mock-entity',
    activity_type: 'create',
    description: 'Registro criado',
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
  },
];

// ============================================================
// MAIN HOOK
// ============================================================

export function useActivityHistory(options: UseActivityHistoryOptions) {
  const {
    entityType,
    entityId,
    limit = 50,
    activityTypes,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = ['activity-history', entityType, entityId, activityTypes?.join(',')];

  // ============================================================
  // QUERY - Listar atividades
  // ============================================================

  const {
    data: activities = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<ActivityRecord[]> => {
      if (!isSupabaseReady) {
        console.log('[ActivityHistory] Supabase não configurado');
        return mockActivities;
      }

      let query = supabase
        .from('activity_logs')
        .select(\`
          *,
          user:user_id(full_name, email, avatar_url)
        \`)
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      if (activityTypes && activityTypes.length > 0) {
        query = query.in('activity_type', activityTypes);
      }

      const { data, error } = await query;

      if (error) {
        // Tabela não existe
        if (error.code === '42P01') {
          console.warn('[ActivityHistory] Tabela não existe');
          return [];
        }
        throw error;
      }

      return (data ?? []) as ActivityRecord[];
    },
    enabled: !!entityType,
    staleTime: 30 * 1000,
  });

  // ============================================================
  // MUTATION - Registrar atividade
  // ============================================================

  const logActivityMutation = useMutation({
    mutationFn: async (params: {
      entityId: string;
      activityType: ActivityType;
      description: string;
      changes?: Record<string, { old: unknown; new: unknown }>;
      metadata?: Record<string, unknown>;
    }) => {
      if (!isSupabaseReady) {
        console.log('[ActivityHistory] Mock: registrando atividade', params.activityType);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          entity_type: entityType,
          entity_id: params.entityId,
          activity_type: params.activityType,
          description: params.description,
          changes: params.changes,
          metadata: params.metadata,
          user_id: userData.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // ============================================================
  // HELPERS
  // ============================================================

  const getActivityIcon = (type: ActivityType): string => {
    const icons: Record<ActivityType, string> = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      restore: '♻️',
      archive: '📦',
      view: '👁️',
      export: '📤',
      import: '📥',
      share: '🔗',
      comment: '💬',
      assign: '👤',
      status_change: '🔄',
      custom: '⚡',
    };
    return icons[type] ?? '📝';
  };

  const getActivityLabel = (type: ActivityType): string => {
    const labels: Record<ActivityType, string> = {
      create: 'Criação',
      update: 'Atualização',
      delete: 'Exclusão',
      restore: 'Restauração',
      archive: 'Arquivamento',
      view: 'Visualização',
      export: 'Exportação',
      import: 'Importação',
      share: 'Compartilhamento',
      comment: 'Comentário',
      assign: 'Atribuição',
      status_change: 'Mudança de Status',
      custom: 'Ação',
    };
    return labels[type] ?? 'Ação';
  };

  const groupByDate = (): Map<string, ActivityRecord[]> => {
    const grouped = new Map<string, ActivityRecord[]>();

    activities.forEach((activity) => {
      const date = new Date(activity.created_at).toLocaleDateString('pt-BR');
      const existing = grouped.get(date) ?? [];
      grouped.set(date, [...existing, activity]);
    });

    return grouped;
  };

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Data
    activities,
    isLoading,
    error,

    // Actions
    logActivity: logActivityMutation.mutate,
    refetch,

    // Helpers
    getActivityIcon,
    getActivityLabel,
    groupByDate,

    // Loading
    isLogging: logActivityMutation.isPending,
  };
}

export default useActivityHistory;
