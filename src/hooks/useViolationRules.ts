import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface ViolationRule {
  id: string;
  name: string;
  description?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: Record<string, unknown>;
  actions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateViolationRuleInput {
  name: string;
  description?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: Record<string, unknown>;
  actions: string[];
  is_active?: boolean;
}

export interface UpdateViolationRuleInput {
  id: string;
  name?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  conditions?: Record<string, unknown>;
  actions?: string[];
  is_active?: boolean;
}

// ============================================================
// QUERIES
// ============================================================

export function useViolationRules() {
  return useQuery({
    queryKey: queryKeys.violationRules.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_rules')
        .select('*')
        .order('severity', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ViolationRule[];
    },
    ...queryPresets.list,
  });
}

export function useActiveViolationRules() {
  return useQuery({
    queryKey: queryKeys.violationRules.active(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_rules')
        .select('*')
        .eq('is_active', true)
        .order('severity', { ascending: false });

      if (error) throw error;
      return data as ViolationRule[];
    },
    ...queryPresets.config,
  });
}

export function useViolationRule(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.violationRules.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('violation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ViolationRule;
    },
    enabled: !!id,
    ...queryPresets.detail,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreateViolationRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateViolationRuleInput) => {
      const { data, error } = await supabase
        .from('violation_rules')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.violationRules(queryClient);
      toast({
        title: 'Regra criada',
        description: 'A regra de violação foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar regra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateViolationRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateViolationRuleInput) => {
      const { data, error } = await supabase
        .from('violation_rules')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.violationRules(queryClient);
      toast({
        title: 'Regra atualizada',
        description: 'A regra de violação foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar regra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteViolationRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('violation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.violationRules(queryClient);
      toast({
        title: 'Regra excluída',
        description: 'A regra de violação foi excluída com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir regra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleViolationRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('violation_rules')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      invalidateRelated.violationRules(queryClient);
      toast({
        title: data.is_active ? 'Regra ativada' : 'Regra desativada',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
