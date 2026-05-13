import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface ViolationComment {
  id: string;
  violation_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface CreateViolationCommentInput {
  violation_id: string;
  content: string;
  is_internal?: boolean;
}

export interface UpdateViolationCommentInput {
  id: string;
  content: string;
}

// ============================================================
// QUERIES
// ============================================================

export function useViolationComments(violationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.violations.comments(violationId || ''),
    queryFn: async () => {
      if (!violationId) return [];
      
      const { data, error } = await supabase
        .from('violation_comments')
        .select(`
          *,
          user:users(id, email, full_name)
        `)
        .eq('violation_id', violationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ViolationComment[];
    },
    enabled: !!violationId,
    ...queryPresets.list,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreateViolationComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateViolationCommentInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('violation_comments')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select(`
          *,
          user:users(id, email, full_name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.violations.comments(input.violation_id) 
      });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<ViolationComment[]>(
        queryKeys.violations.comments(input.violation_id)
      );

      // Optimistically update
      const optimisticComment: ViolationComment = {
        id: `temp-${Date.now()}`,
        violation_id: input.violation_id,
        user_id: 'current-user',
        content: input.content,
        is_internal: input.is_internal || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<ViolationComment[]>(
        queryKeys.violations.comments(input.violation_id),
        (old) => [...(old || []), optimisticComment]
      );

      return { previousComments, violationId: input.violation_id };
    },
    onError: (err, input, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.violations.comments(context.violationId),
          context.previousComments
        );
      }
      toast({
        title: 'Erro ao adicionar comentário',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: (data, input) => {
      // Replace optimistic with real data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.violations.comments(input.violation_id) 
      });
      toast({
        title: 'Comentário adicionado',
        description: 'O comentário foi adicionado com sucesso.',
      });
    },
  });
}

export function useUpdateViolationComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, content }: UpdateViolationCommentInput) => {
      const { data, error } = await supabase
        .from('violation_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.violations.comments(data.violation_id) 
      });
      toast({
        title: 'Comentário atualizado',
        description: 'O comentário foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar comentário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteViolationComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, violationId }: { id: string; violationId: string }) => {
      const { error } = await supabase
        .from('violation_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { violationId };
    },
    onMutate: async ({ id, violationId }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.violations.comments(violationId) 
      });

      const previousComments = queryClient.getQueryData<ViolationComment[]>(
        queryKeys.violations.comments(violationId)
      );

      queryClient.setQueryData<ViolationComment[]>(
        queryKeys.violations.comments(violationId),
        (old) => old?.filter(c => c.id !== id) || []
      );

      return { previousComments, violationId };
    },
    onError: (err, _, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.violations.comments(context.violationId),
          context.previousComments
        );
      }
      toast({
        title: 'Erro ao excluir comentário',
        description: err.message,
        variant: 'destructive',
      });
    },
    onSuccess: (_, { violationId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.violations.comments(violationId) 
      });
      toast({
        title: 'Comentário excluído',
        description: 'O comentário foi excluído com sucesso.',
      });
    },
  });
}
