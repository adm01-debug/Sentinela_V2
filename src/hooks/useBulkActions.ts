// ============================================================
// BULK ACTIONS HOOK
// Ações em lote para múltiplos registros
// ============================================================

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

export type BulkActionType = 
  | 'delete'
  | 'archive'
  | 'restore'
  | 'update'
  | 'export'
  | 'duplicate'
  | 'assign'
  | 'tag'
  | 'status';

export interface BulkActionResult {
  success: string[];
  failed: Array<{ id: string; error: string }>;
  total: number;
}

interface UseBulkActionsConfig {
  table: string;
  queryKey?: unknown[];
  onSuccess?: (result: BulkActionResult) => void;
  onError?: (error: Error) => void;
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useBulkActions<T extends { id: string }>(config: UseBulkActionsConfig) {
  const { table, queryKey, onSuccess, onError } = config;
  const queryClient = useQueryClient();

  // ============================================================
  // SELECTION STATE
  // ============================================================

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // ============================================================
  // SELECTION HANDLERS
  // ============================================================

  const toggleSelection = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectMany = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectMany = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((allIds: string[]) => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(allIds));
      setSelectAll(true);
    }
  }, [selectAll]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAll(false);
  }, []);

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  // ============================================================
  // BULK DELETE MUTATION
  // ============================================================

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]): Promise<BulkActionResult> => {
      // Proceed to delete


      const result: BulkActionResult = { success: [], failed: [], total: ids.length };

      // Soft delete (se a tabela suporta)
      const { data, error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
        .in('id', ids)
        .select('id');

      if (error) {
        // Se soft delete não funcionar, tenta hard delete
        const { error: hardError } = await supabase
          .from(table)
          .delete()
          .in('id', ids);

        if (hardError) {
          ids.forEach((id) => result.failed.push({ id, error: hardError.message }));
        } else {
          result.success = ids;
        }
      } else {
        result.success = (data ?? []).map((d) => d.id);
      }

      return result;
    },
    onSuccess: (result) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(
        result.failed.length > 0
          ? `${result.success.length} removidos, ${result.failed.length} erros`
          : `${result.success.length} itens removidos`
      );
      onSuccess?.(result);
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover itens');
      onError?.(error);
    },
  });

  // ============================================================
  // BULK UPDATE MUTATION
  // ============================================================

  const bulkUpdateMutation = useMutation({
    mutationFn: async (params: { ids: string[]; updates: Partial<T> }): Promise<BulkActionResult> => {
      const { ids, updates } = params;

      // Proceed to update


      const result: BulkActionResult = { success: [], failed: [], total: ids.length };

      const { data, error } = await supabase
        .from(table)
        .update(updates as Record<string, unknown>)
        .in('id', ids)
        .select('id');

      if (error) {
        ids.forEach((id) => result.failed.push({ id, error: error.message }));
      } else {
        result.success = (data ?? []).map((d) => d.id);
      }

      return result;
    },
    onSuccess: (result) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${result.success.length} itens atualizados`);
      onSuccess?.(result);
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar itens');
      onError?.(error);
    },
  });

  // ============================================================
  // BULK ARCHIVE MUTATION
  // ============================================================

  const bulkArchiveMutation = useMutation({
    mutationFn: async (ids: string[]): Promise<BulkActionResult> => {
      // Proceed to archive


      const { data, error } = await supabase
        .from(table)
        .update({ archived_at: new Date().toISOString(), status: 'archived' })
        .in('id', ids)
        .select('id');

      if (error) {
        return { success: [], failed: ids.map((id) => ({ id, error: error.message })), total: ids.length };
      }

      return { success: (data ?? []).map((d) => d.id), failed: [], total: ids.length };
    },
    onSuccess: (result) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${result.success.length} itens arquivados`);
      onSuccess?.(result);
    },
    onError: (error: Error) => {
      toast.error('Erro ao arquivar itens');
      onError?.(error);
    },
  });

  // ============================================================
  // BULK RESTORE MUTATION
  // ============================================================

  const bulkRestoreMutation = useMutation({
    mutationFn: async (ids: string[]): Promise<BulkActionResult> => {
      // Proceed to restore


      const { data, error } = await supabase
        .from(table)
        .update({ deleted_at: null, archived_at: null, status: 'active' })
        .in('id', ids)
        .select('id');

      if (error) {
        return { success: [], failed: ids.map((id) => ({ id, error: error.message })), total: ids.length };
      }

      return { success: (data ?? []).map((d) => d.id), failed: [], total: ids.length };
    },
    onSuccess: (result) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${result.success.length} itens restaurados`);
      onSuccess?.(result);
    },
    onError: (error: Error) => {
      toast.error('Erro ao restaurar itens');
      onError?.(error);
    },
  });

  // ============================================================
  // BULK DUPLICATE MUTATION
  // ============================================================

  const bulkDuplicateMutation = useMutation({
    mutationFn: async (ids: string[]): Promise<BulkActionResult> => {
      // Proceed to duplicate


      // Buscar dados originais
      const { data: originals, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .in('id', ids);

      if (fetchError || !originals) {
        return { success: [], failed: ids.map((id) => ({ id, error: 'Não encontrado' })), total: ids.length };
      }

      // Criar cópias (removendo id, created_at, updated_at)
      const copies = originals.map((item) => {
        const { id, created_at, updated_at, ...rest } = item as Record<string, unknown>;
        return {
          ...rest,
          name: rest.name ? `${rest.name} (Cópia)` : undefined,
          title: rest.title ? `${rest.title} (Cópia)` : undefined,
        };
      });

      const { data, error } = await supabase
        .from(table)
        .insert(copies)
        .select('id');

      if (error) {
        return { success: [], failed: ids.map((id) => ({ id, error: error.message })), total: ids.length };
      }

      return { success: (data ?? []).map((d) => d.id), failed: [], total: ids.length };
    },
    onSuccess: (result) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      toast.success(`${result.success.length} itens duplicados`);
      onSuccess?.(result);
    },
    onError: (error: Error) => {
      toast.error('Erro ao duplicar itens');
      onError?.(error);
    },
  });

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Selection state
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
    selectAll,

    // Selection actions
    toggleSelection,
    selectMany,
    deselectMany,
    toggleSelectAll,
    clearSelection,
    isSelected,

    // Bulk actions
    bulkDelete: (ids?: string[]) => bulkDeleteMutation.mutate(ids ?? Array.from(selectedIds)),
    bulkUpdate: (updates: Partial<T>, ids?: string[]) =>
      bulkUpdateMutation.mutate({ ids: ids ?? Array.from(selectedIds), updates }),
    bulkArchive: (ids?: string[]) => bulkArchiveMutation.mutate(ids ?? Array.from(selectedIds)),
    bulkRestore: (ids?: string[]) => bulkRestoreMutation.mutate(ids ?? Array.from(selectedIds)),
    bulkDuplicate: (ids?: string[]) => bulkDuplicateMutation.mutate(ids ?? Array.from(selectedIds)),

    // Loading states
    isDeleting: bulkDeleteMutation.isPending,
    isUpdating: bulkUpdateMutation.isPending,
    isArchiving: bulkArchiveMutation.isPending,
    isRestoring: bulkRestoreMutation.isPending,
    isDuplicating: bulkDuplicateMutation.isPending,
    isProcessing:
      bulkDeleteMutation.isPending ||
      bulkUpdateMutation.isPending ||
      bulkArchiveMutation.isPending ||
      bulkRestoreMutation.isPending ||
      bulkDuplicateMutation.isPending,
  };
}

export default useBulkActions;
