import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys, queryPresets } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface SavedFilter {
  id: string;
  user_id: string;
  module: string;
  name: string;
  filters: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSavedFilterInput {
  module: string;
  name: string;
  filters: Record<string, unknown>;
  is_default?: boolean;
}

export interface UpdateSavedFilterInput {
  id: string;
  name?: string;
  filters?: Record<string, unknown>;
  is_default?: boolean;
}

// ============================================================
// QUERIES
// ============================================================

export function useSavedFilters(module: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.savedFilters.module(module, user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .eq('module', module)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as SavedFilter[];
    },
    enabled: !!user?.id && !!module,
    ...queryPresets.list,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreateSavedFilter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateSavedFilterInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.savedFilters.module(input.module, user?.id) 
      });
      toast({
        title: 'Filtro salvo',
        description: 'O filtro foi salvo com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar filtro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateSavedFilter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateSavedFilterInput) => {
      const { data, error } = await supabase
        .from('saved_filters')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.savedFilters.module(data.module, user?.id) 
      });
      toast({
        title: 'Filtro atualizado',
        description: 'O filtro foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar filtro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteSavedFilter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, module }: { id: string; module: string }) => {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { module };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.savedFilters.module(data.module, user?.id) 
      });
      toast({
        title: 'Filtro excluído',
        description: 'O filtro foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir filtro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSetDefaultFilter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, module }: { id: string; module: string }) => {
      // First, unset all defaults for this module
      await supabase
        .from('saved_filters')
        .update({ is_default: false })
        .eq('user_id', user?.id)
        .eq('module', module);

      // Then set the new default
      const { data, error } = await supabase
        .from('saved_filters')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.savedFilters.module(data.module, user?.id) 
      });
      toast({
        title: 'Filtro padrão definido',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao definir filtro padrão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
