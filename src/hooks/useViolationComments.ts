import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ViolationComment {
  id: string;
  violation_id: string;
  user_id: string;
  content: string;
  comment_type: 'note' | 'action' | 'resolution' | 'escalation';
  is_internal: boolean;
  is_edited: boolean;
  edited_at: string | null;
  mentions: string[] | null;
  attachments: any[];
  created_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
}

export interface ViolationAction {
  id: string;
  violation_id: string;
  user_id: string;
  action_type: string;
  notes: string | null;
  previous_status: string | null;
  new_status: string | null;
  created_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
}

type ActionType = 'acknowledge' | 'investigate' | 'warn' | 'escalate' | 'resolve' | 'dismiss' | 'reopen';

// Buscar comentários de uma violação
export function useViolationComments(violationId: string) {
  return useQuery({
    queryKey: ['violation-comments', violationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_comments')
        .select('*, user:profiles(email, full_name)')
        .eq('violation_id', violationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ViolationComment[];
    },
    enabled: !!violationId,
  });
}

// Buscar histórico de ações de uma violação
export function useViolationActions(violationId: string) {
  return useQuery({
    queryKey: ['violation-actions', violationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_actions')
        .select('*, user:profiles(email, full_name)')
        .eq('violation_id', violationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ViolationAction[];
    },
    enabled: !!violationId,
  });
}

// Adicionar comentário
export function useAddComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      violationId,
      content,
      commentType = 'note',
      isInternal = false,
    }: {
      violationId: string;
      content: string;
      commentType?: ViolationComment['comment_type'];
      isInternal?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('violation_comments')
        .insert({
          violation_id: violationId,
          user_id: user?.id,
          content,
          comment_type: commentType,
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['violation-comments', variables.violationId] });
      toast.success('Comentário adicionado!');
    },
    onError: (error: any) => {
      toast.error('Erro ao adicionar comentário: ' + error.message);
    },
  });
}

// Editar comentário
export function useEditComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      violationId,
      content,
    }: {
      commentId: string;
      violationId: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from('violation_comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['violation-comments', variables.violationId] });
      toast.success('Comentário editado!');
    },
  });
}

// Deletar comentário
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, violationId }: { commentId: string; violationId: string }) => {
      const { error } = await supabase
        .from('violation_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['violation-comments', variables.violationId] });
      toast.success('Comentário removido!');
    },
  });
}

// Registrar ação na violação
export function useRecordAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      violationId,
      actionType,
      notes,
    }: {
      violationId: string;
      actionType: ActionType;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('record_violation_action', {
        p_violation_id: violationId,
        p_action_type: actionType,
        p_notes: notes || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['violation-actions', variables.violationId] });
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      toast.success('Ação registrada!');
    },
    onError: (error: any) => {
      toast.error('Erro ao registrar ação: ' + error.message);
    },
  });
}

// Configuração de tipos de ação
export const actionConfig: Record<ActionType, { label: string; icon: string; color: string }> = {
  acknowledge: { label: 'Reconhecer', icon: '👁️', color: 'text-blue-500' },
  investigate: { label: 'Investigar', icon: '🔍', color: 'text-purple-500' },
  warn: { label: 'Advertir', icon: '⚠️', color: 'text-amber-500' },
  escalate: { label: 'Escalar', icon: '📢', color: 'text-orange-500' },
  resolve: { label: 'Resolver', icon: '✅', color: 'text-green-500' },
  dismiss: { label: 'Dispensar', icon: '❌', color: 'text-gray-500' },
  reopen: { label: 'Reabrir', icon: '🔄', color: 'text-red-500' },
};

// Configuração de status
export const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Aberto', color: 'bg-red-500' },
  acknowledged: { label: 'Reconhecido', color: 'bg-blue-500' },
  investigating: { label: 'Investigando', color: 'bg-purple-500' },
  escalated: { label: 'Escalado', color: 'bg-orange-500' },
  resolved: { label: 'Resolvido', color: 'bg-green-500' },
  dismissed: { label: 'Dispensado', color: 'bg-gray-500' },
};
