import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

export interface InternetAccessRule {
  id: string;
  name: string;
  rule_type: 'allow' | 'block';
  pattern: string;
  pattern_type: 'domain' | 'url' | 'regex';
  applies_to: 'all' | 'teams' | 'employees';
  target_ids?: string[];
  is_active: boolean;
  created_at: string;
}

export function useInternetAccessRules() {
  return useQuery({
    queryKey: queryKeys.internetAccess.rules(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internet_access_rules')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as InternetAccessRule[];
    },
    ...queryPresets.list,
  });
}

export function useCreateInternetAccessRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: Omit<InternetAccessRule, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('internet_access_rules')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.internetAccess(queryClient);
      toast({ title: 'Regra criada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar regra', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateInternetAccessRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<InternetAccessRule>) => {
      const { data, error } = await supabase
        .from('internet_access_rules')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.internetAccess(queryClient);
      toast({ title: 'Regra atualizada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteInternetAccessRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('internet_access_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.internetAccess(queryClient);
      toast({ title: 'Regra excluída' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
