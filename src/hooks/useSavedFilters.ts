import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  module: string;
  filters: Record<string, any>;
  sort_field: string | null;
  sort_direction: 'asc' | 'desc' | null;
  visible_columns: string[] | null;
  is_default: boolean;
  is_shared: boolean;
  color: string | null;
  icon: string | null;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

interface CreateFilterInput {
  name: string;
  description?: string;
  module: string;
  filters: Record<string, any>;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  visibleColumns?: string[];
  isDefault?: boolean;
  isShared?: boolean;
  color?: string;
  icon?: string;
}

export function useSavedFilters(module: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar filtros do módulo
  const { data: filters, isLoading } = useQuery({
    queryKey: ['saved-filters', module, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('module', module)
        .or(`user_id.eq.${user?.id},is_shared.eq.true`)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data as SavedFilter[];
    },
    enabled: !!user?.id,
  });

  // Filtro padrão do usuário
  const defaultFilter = filters?.find(f => f.is_default && f.user_id === user?.id);

  // Criar filtro
  const createFilter = useMutation({
    mutationFn: async (input: CreateFilterInput) => {
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: user?.id,
          name: input.name,
          description: input.description,
          module: input.module,
          filters: input.filters,
          sort_field: input.sortField,
          sort_direction: input.sortDirection,
          visible_columns: input.visibleColumns,
          is_default: input.isDefault || false,
          is_shared: input.isShared || false,
          color: input.color,
          icon: input.icon,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', module] });
      toast.success('Filtro salvo com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar filtro: ' + error.message);
    },
  });

  // Atualizar filtro
  const updateFilter = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavedFilter> & { id: string }) => {
      const { data, error } = await supabase
        .from('saved_filters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', module] });
      toast.success('Filtro atualizado!');
    },
  });

  // Deletar filtro
  const deleteFilter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', module] });
      toast.success('Filtro removido!');
    },
  });

  // Registrar uso do filtro
  const useFilter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_filters')
        .update({
          usage_count: supabase.rpc('increment', { row_id: id }),
          last_used_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
  });

  // Definir como padrão
  const setAsDefault = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_filters')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', module] });
      toast.success('Filtro definido como padrão!');
    },
  });

  return {
    filters: filters || [],
    defaultFilter,
    isLoading,
    createFilter,
    updateFilter,
    deleteFilter,
    useFilter,
    setAsDefault,
  };
}
