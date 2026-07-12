import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRuleStatus = 'allowed' | 'blocked' | 'monitored';
export type AppRuleCategory = 'productivity' | 'communication' | 'entertainment' | 'development' | 'other';

export interface ApplicationRuleRow {
  id: string;
  name: string;
  category: AppRuleCategory;
  status: AppRuleStatus;
  created_at: string;
  updated_at: string;
}

const KEY = ['application-rules'] as const;

export function useApplicationRules() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<ApplicationRuleRow[]> => {
      const { data, error } = await supabase
        .from('application_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ApplicationRuleRow[];
    },
    staleTime: 30_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const add = useMutation({
    mutationFn: async (input: { name: string; category: AppRuleCategory; status: AppRuleStatus }) => {
      const { data, error } = await supabase
        .from('application_rules')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { invalidate(); toast.success('Aplicação adicionada'); },
    onError: (e: Error) => toast.error(e.message || 'Erro ao adicionar aplicação'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppRuleStatus }) => {
      const { error } = await supabase.from('application_rules').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); },
    onError: (e: Error) => toast.error(e.message || 'Erro ao atualizar status'),
  });

  const editRule = useMutation({
    mutationFn: async ({ id, name, category }: { id: string; name: string; category: AppRuleCategory }) => {
      const { error } = await supabase.from('application_rules').update({ name, category }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Aplicação atualizada'); },
    onError: (e: Error) => toast.error(e.message || 'Erro ao editar aplicação'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('application_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Aplicação removida'); },
    onError: (e: Error) => toast.error(e.message || 'Erro ao remover aplicação'),
  });

  return {
    rules: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    add: async (name: string, category: string, status: AppRuleStatus) => {
      await add.mutateAsync({ name, category: category as AppRuleCategory, status });
      return true;
    },
    updateStatus: (id: string, status: AppRuleStatus) => updateStatus.mutate({ id, status }),
    editRule: async (id: string, name: string, category: string) => {
      await editRule.mutateAsync({ id, name, category: category as AppRuleCategory });
      return true;
    },
    remove: async (id: string) => {
      await remove.mutateAsync(id);
      return true;
    },
  };
}
