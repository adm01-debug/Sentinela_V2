import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

interface Policy {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  policy_type: string;
  content: string | null;
  created_at: string;
}

export function usePolicies() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['security-policies'],
    queryFn: async (): Promise<Policy[]> => {
      const { data, error } = await supabase
        .from('security_policies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      return (data ?? []).map((row): Policy => ({
        id: row.id,
        name: row.name,
        description: row.description,
        enabled: row.is_active ?? true,
        policy_type: row.policy_type ?? 'general',
        content: row.content,
        created_at: row.created_at,
      }));
    },
    staleTime: 60_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const policy = (query.data ?? []).find(p => p.id === id);
      if (!policy) throw new Error('Policy not found');
      const { error } = await supabase
        .from('security_policies')
        .update({ is_active: !policy.enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['security-policies'] }),
  });

  const toggle = useCallback((id: string) => toggleMutation.mutate(id), [toggleMutation]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('security_policies').delete().eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['security-policies'] });
  }, [queryClient]);

  const add = useCallback(async (name: string, description: string, rules: string[] = []) => {
    const { data, error } = await supabase
      .from('security_policies')
      .insert({ name, description, content: JSON.stringify(rules), is_active: true })
      .select()
      .single();
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['security-policies'] });
    return data;
  }, [queryClient]);

  return {
    policies: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    add,
    toggle,
    remove,
    refetch: query.refetch,
  };
}
