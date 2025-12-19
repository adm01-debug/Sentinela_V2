import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  is_active: boolean;
  last_triggered_at?: string;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status?: number;
  response_body?: string;
  success: boolean;
  created_at: string;
}

export interface CreateWebhookInput {
  name: string;
  url: string;
  secret?: string;
  events: string[];
  is_active?: boolean;
}

export interface UpdateWebhookInput {
  id: string;
  name?: string;
  url?: string;
  secret?: string;
  events?: string[];
  is_active?: boolean;
}

// ============================================================
// QUERIES
// ============================================================

export function useWebhooks() {
  return useQuery({
    queryKey: queryKeys.webhooks.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Webhook[];
    },
    ...queryPresets.list,
  });
}

export function useWebhook(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.webhooks.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Webhook;
    },
    enabled: !!id,
    ...queryPresets.detail,
  });
}

export function useWebhookLogs(webhookId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.webhooks.logs(webhookId || ''),
    queryFn: async () => {
      if (!webhookId) return [];
      
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as WebhookLog[];
    },
    enabled: !!webhookId,
    ...queryPresets.list,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateWebhookInput) => {
      const { data, error } = await supabase
        .from('webhooks')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.webhooks(queryClient);
      toast({
        title: 'Webhook criado',
        description: 'O webhook foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar webhook',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateWebhookInput) => {
      const { data, error } = await supabase
        .from('webhooks')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.webhooks(queryClient);
      toast({
        title: 'Webhook atualizado',
        description: 'O webhook foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar webhook',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.webhooks(queryClient);
      toast({
        title: 'Webhook excluído',
        description: 'O webhook foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir webhook',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTestWebhook() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: { 
          webhook_id: id, 
          test: true,
          event_type: 'test',
          payload: { message: 'Test webhook' },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Teste enviado',
        description: 'O webhook de teste foi enviado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao testar webhook',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleWebhook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('webhooks')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      invalidateRelated.webhooks(queryClient);
      toast({
        title: data.is_active ? 'Webhook ativado' : 'Webhook desativado',
        description: `O webhook foi ${data.is_active ? 'ativado' : 'desativado'} com sucesso.`,
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
