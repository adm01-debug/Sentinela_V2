// ============================================================
// SAVED FILTERS HOOK
// Gerenciamento de filtros salvos por usuário e entidade
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

export interface SavedFilter {
  id: string;
  name: string;
  filters: unknown;
  is_default: boolean;
  created_at: string;
  entity_type: string;
}

interface UseSavedFiltersOptions {
  entityType: string;
  onApply?: (filters: any) => void;
}

// ============================================================
// MOCK DATA (quando Supabase não está configurado)
// ============================================================

const mockFilters: SavedFilter[] = [
  {
    id: 'mock-1',
    name: 'Filtro Padrão',
    filters: { status: 'active' },
    is_default: true,
    created_at: new Date().toISOString(),
    entity_type: 'default',
  },
];

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export function useSavedFilters({ entityType, onApply }: UseSavedFiltersOptions) {
  const queryClient = useQueryClient();
  const queryKey = ['saved-filters', entityType];

  // ============================================================
  // QUERY - Listar filtros salvos
  // ============================================================
  const {
    data: filters = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<SavedFilter[]> => {
      // Ready to fetch


      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existe, retorna array vazio
        if (error.code === '42P01') {
          logger.warn('[SavedFilters] Tabela não existe ainda');
          return [];
        }
        throw error;
      }

      return (data ?? []) as SavedFilter[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // ============================================================
  // MUTATION - Salvar novo filtro
  // ============================================================
  const saveFilterMutation = useMutation({
    mutationFn: async (filter: { name: string; filters: unknown; is_default?: boolean }) => {
      // Proceed to save


      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: userData.user?.id,
          entity_type: entityType,
          name: filter.name,
          filters: filter.filters,
          is_default: filter.is_default ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro salvo com sucesso!');
    },
    onError: (error: Error) => {
      logger.error('[SavedFilters] Erro ao salvar:', error);
      toast.error('Erro ao salvar filtro');
    },
  });

  // ============================================================
  // MUTATION - Deletar filtro
  // ============================================================
  const deleteFilterMutation = useMutation({
    mutationFn: async (id: any) => {
      // Proceed to delete


      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro removido');
    },
    onError: (error: Error) => {
      logger.error('[SavedFilters] Erro ao deletar:', error);
      toast.error('Erro ao remover filtro');
    },
  });

  // ============================================================
  // MUTATION - Definir filtro padrão
  // ============================================================
  const setDefaultMutation = useMutation({
    mutationFn: async (id: any) => {
      // Proceed to set default


      // Remove default de todos os filtros do mesmo tipo
      await supabase
        .from('saved_filters')
        .update({ is_default: false })
        .eq('entity_type', entityType);

      // Define novo default
      const { error } = await supabase
        .from('saved_filters')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro padrão definido');
    },
    onError: (error: Error) => {
      logger.error('[SavedFilters] Erro ao definir padrão:', error);
      toast.error('Erro ao definir filtro padrão');
    },
  });

  // ============================================================
  // HELPERS
  // ============================================================

  const applyFilter = (filter: SavedFilter) => {
    if (onApply) {
      onApply(filter.filters);
      toast.info(`Filtro "${filter.name}" aplicado`);
    }
  };

  const getDefaultFilter = (): SavedFilter | undefined => {
    return filters.find((f) => f.is_default);
  };

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Data
    filters,
    defaultFilter: getDefaultFilter(),
    isLoading,
    error,

    // Actions
    saveFilter: saveFilterMutation.mutate,
    deleteFilter: deleteFilterMutation.mutate,
    setDefault: setDefaultMutation.mutate,
    applyFilter,

    // Loading states
    isSaving: saveFilterMutation.isPending,
    isDeleting: deleteFilterMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
  };
}

// ============================================================
// HOOK SIMPLIFICADO (para uso rápido)
// ============================================================

export function useEntityFilters(entityType: string) {
  return useSavedFilters({ entityType });
}

export default useSavedFilters;
