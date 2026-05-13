// ============================================================
// SOFT DELETE HOOK
// Exclusão suave com suporte a restauração
// ============================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

export interface SoftDeleteOptions {
  table: string;
  queryKey?: unknown[];
  deletedAtField?: string;
  statusField?: string;
  deletedStatus?: string;
  activeStatus?: string;
  onSuccess?: (id: string, action: 'delete' | 'restore') => void;
  onError?: (error: Error) => void;
}

export interface SoftDeleteResult {
  softDelete: (id: string) => void;
  softDeleteMany: (ids: string[]) => void;
  restore: (id: string) => void;
  restoreMany: (ids: string[]) => void;
  hardDelete: (id: string) => void;
  hardDeleteMany: (ids: string[]) => void;
  isDeleting: boolean;
  isRestoring: boolean;
  isHardDeleting: boolean;
  error: Error | null;
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useSoftDelete(options: SoftDeleteOptions): SoftDeleteResult {
  const {
    table,
    queryKey,
    deletedAtField = 'deleted_at',
    statusField,
    deletedStatus = 'deleted',
    activeStatus = 'active',
    onSuccess,
    onError,
  } = options;

  const queryClient = useQueryClient();

  // ============================================================
  // SOFT DELETE MUTATION
  // ============================================================

  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Proceed to delete


      const updates = {
        [deletedAtField]: new Date().toISOString(),
      };

      if (statusField) {
        updates[statusField] = deletedStatus;
      }

      const { error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      toast.success('Registro movido para lixeira');
      onSuccess?.(id, 'delete');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir registro');
      onError?.(error);
    },
  });

  // ============================================================
  // SOFT DELETE MANY MUTATION
  // ============================================================

  const softDeleteManyMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Proceed to delete many


      const updates = {
        [deletedAtField]: new Date().toISOString(),
      };

      if (statusField) {
        updates[statusField] = deletedStatus;
      }

      const { error } = await supabase
        .from(table)
        .update(updates)
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      toast.success(`${ids.length} registros movidos para lixeira`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir registros');
      onError?.(error);
    },
  });

  // ============================================================
  // RESTORE MUTATION
  // ============================================================

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      // Proceed to restore


      const updates: Record<string, string | null> = {
        [deletedAtField]: null,
      };

      if (statusField) {
        updates[statusField] = activeStatus;
      }

      const { error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      toast.success('Registro restaurado');
      onSuccess?.(id, 'restore');
    },
    onError: (error: Error) => {
      toast.error('Erro ao restaurar registro');
      onError?.(error);
    },
  });

  // ============================================================
  // RESTORE MANY MUTATION
  // ============================================================

  const restoreManyMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Proceed to restore many


      const updates: Record<string, string | null> = {
        [deletedAtField]: null,
      };

      if (statusField) {
        updates[statusField] = activeStatus;
      }

      const { error } = await supabase
        .from(table)
        .update(updates)
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      toast.success(`${ids.length} registros restaurados`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao restaurar registros');
      onError?.(error);
    },
  });

  // ============================================================
  // HARD DELETE MUTATION
  // ============================================================

  const hardDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Proceed to hard delete


      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      toast.success('Registro excluído permanentemente');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir registro permanentemente');
      onError?.(error);
    },
  });

  // ============================================================
  // HARD DELETE MANY MUTATION
  // ============================================================

  const hardDeleteManyMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Proceed to hard delete many


      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      toast.success(`${ids.length} registros excluídos permanentemente`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir registros permanentemente');
      onError?.(error);
    },
  });

  // ============================================================
  // RETURN
  // ============================================================

  return {
    softDelete: softDeleteMutation.mutate,
    softDeleteMany: softDeleteManyMutation.mutate,
    restore: restoreMutation.mutate,
    restoreMany: restoreManyMutation.mutate,
    hardDelete: hardDeleteMutation.mutate,
    hardDeleteMany: hardDeleteManyMutation.mutate,
    isDeleting: softDeleteMutation.isPending || softDeleteManyMutation.isPending,
    isRestoring: restoreMutation.isPending || restoreManyMutation.isPending,
    isHardDeleting: hardDeleteMutation.isPending || hardDeleteManyMutation.isPending,
    error: (
      softDeleteMutation.error ||
      restoreMutation.error ||
      hardDeleteMutation.error
    ) as Error | null,
  };
}

export default useSoftDelete;
