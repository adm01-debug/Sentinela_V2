// ============================================================
// ENTITY VERSIONS HOOK
// Versionamento e histórico de alterações de entidades
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

export interface EntityVersion {
  id: string;
  entity_type: string;
  entity_id: string;
  version_number: number;
  data: Record<string, unknown>;
  changed_by: string | null;
  changed_at: string;
  change_summary: string | null;
  user?: {
    full_name?: string;
    email?: string;
  };
}

export interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'changed';
}

interface UseVersionsOptions {
  entityType: string;
  entityId: string;
  enabled?: boolean;
}

// ============================================================
// MOCK DATA
// ============================================================

const mockVersions: EntityVersion[] = [
  {
    id: 'mock-v1',
    entity_type: 'default',
    entity_id: 'mock-entity',
    version_number: 1,
    data: { name: 'Versão Inicial', status: 'active' },
    changed_by: null,
    changed_at: new Date().toISOString(),
    change_summary: 'Criação inicial',
  },
];

// ============================================================
// MAIN HOOK
// ============================================================

export function useVersions({ entityType, entityId, enabled = true }: UseVersionsOptions) {
  const queryClient = useQueryClient();
  const queryKey = ['versions', entityType, entityId];

  // ============================================================
  // QUERY - Listar versões
  // ============================================================
  const {
    data: versions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<EntityVersion[]> => {
      // Ready to fetch


      const { data, error } = await supabase
        .from('entity_versions')
        .select(`
          *,
          user:changed_by(full_name, email)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('version_number', { ascending: false });

      if (error) {
        // Tabela não existe
        if (error.code === '42P01') {
          logger.warn('[Versions] Tabela não existe');
          return [];
        }
        throw error;
      }

      return (data ?? []) as EntityVersion[];
    },
    enabled: enabled && !!entityId,
    staleTime: 30 * 1000,
  });

  // ============================================================
  // MUTATION - Criar versão manualmente
  // ============================================================
  const createVersionMutation = useMutation({
    mutationFn: async (params: { data: unknown; summary?: string }) => {
      // Proceed to create


      const { data: userData } = await supabase.auth.getUser();
      const nextVersion = versions.length > 0 ? versions[0].version_number + 1 : 1;

      const { data, error } = await supabase
        .from('entity_versions')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          version_number: nextVersion,
          data: params.data,
          changed_by: userData.user?.id,
          change_summary: params.summary,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Versão salva');
    },
    onError: (error: Error) => {
      logger.error('[Versions] Erro ao criar versão:', error);
      toast.error('Erro ao salvar versão');
    },
  });

  // ============================================================
  // MUTATION - Restaurar versão
  // ============================================================
  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const version = versions.find((v: any) => v.id === versionId);
      if (!version) throw new Error('Versão não encontrada');

      // Proceed to restore


      // Criar nova versão com os dados antigos
      const { data: userData } = await supabase.auth.getUser();
      const nextVersion = versions[0].version_number + 1;

      // Salvar versão atual antes de restaurar
      const { error: versionError } = await supabase
        .from('entity_versions')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          version_number: nextVersion,
          data: version.data,
          changed_by: userData.user?.id,
          change_summary: `Restaurado da versão ${version.version_number}`,
        });

      if (versionError) throw versionError;

      // Atualizar entidade original
      const { error: updateError } = await supabase
        .from(entityType)
        .update(version.data)
        .eq('id', entityId);

      if (updateError) throw updateError;

      return version.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
      toast.success('Versão restaurada');
    },
    onError: (error: Error) => {
      logger.error('[Versions] Erro ao restaurar:', error);
      toast.error('Erro ao restaurar versão');
    },
  });

  // ============================================================
  // HELPERS
  // ============================================================

  /**
   * Compara duas versões e retorna as diferenças
   */
  const compareVersions = (v1: EntityVersion, v2: EntityVersion): VersionDiff[] => {
    const diffs: VersionDiff[] = [];
    const allKeys = new Set([...Object.keys(v1.data), ...Object.keys(v2.data)]);

    allKeys.forEach((key: any) => {
      const oldVal = v1.data[key];
      const newVal = v2.data[key];

      if (oldVal === undefined && newVal !== undefined) {
        diffs.push({ field: key, oldValue: oldVal, newValue: newVal, type: 'added' });
      } else if (oldVal !== undefined && newVal === undefined) {
        diffs.push({ field: key, oldValue: oldVal, newValue: newVal, type: 'removed' });
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push({ field: key, oldValue: oldVal, newValue: newVal, type: 'changed' });
      }
    });

    return diffs;
  };

  /**
   * Obtém versão específica
   */
  const getVersion = (versionNumber): EntityVersion | undefined => {
    return versions.find((v: any) => v.version_number === versionNumber);
  };

  /**
   * Obtém versão mais recente
   */
  const getLatestVersion = (): EntityVersion | undefined => {
    return versions[0];
  };

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Data
    versions,
    latestVersion: getLatestVersion(),
    totalVersions: versions.length,
    isLoading,
    error,

    // Actions
    createVersion: createVersionMutation.mutate,
    restoreVersion: restoreVersionMutation.mutate,

    // Helpers
    compareVersions,
    getVersion,
    getLatestVersion,

    // Loading states
    isCreating: createVersionMutation.isPending,
    isRestoring: restoreVersionMutation.isPending,
  };
}

// ============================================================
// HOOK SIMPLIFICADO
// ============================================================

export function useEntityVersions(entityType: string, entityId: string) {
  return useVersions({ entityType, entityId });
}

export default useVersions;
