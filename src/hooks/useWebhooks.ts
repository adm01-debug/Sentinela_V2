import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';
import { webhookService } from '@/services/webhookService';

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
  retry_count?: number;
  timeout_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: unknown;
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
    queryFn: () => webhookService.getWebhooks(),
    ...queryPresets.list,
  });
}

export function useWebhook(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.webhooks.detail(id || ''),
    queryFn: () => webhookService.getWebhookById(id as string),
    enabled: !!id,
    ...queryPresets.detail,
  });
}

export function useWebhookLogs(webhookId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.webhooks.logs(webhookId || ''),
    queryFn: () => webhookService.getWebhookLogs(webhookId as string),
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
    mutationFn: (input: CreateWebhookInput) => webhookService.createWebhook(input),
    onSuccess: () => {
      invalidateRelated.webhooks(queryClient);
      toast({
        title: 'Webhook criado',
        description: 'O webhook foi criado com sucesso.',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao criar webhook',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateWebhookInput) => webhookService.updateWebhook(id, input),
    onSuccess: () => {
      invalidateRelated.webhooks(queryClient);
      toast({
        title: 'Webhook atualizado',
        description: 'O webhook foi atualizado com sucesso.',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao atualizar webhook',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => webhookService.deleteWebhook(id),
    onSuccess: () => {
      invalidateRelated.webhooks(queryClient);
      toast({
        title: 'Webhook excluído',
        description: 'O webhook foi excluído com sucesso.',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao excluir webhook',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    },
  });
}

export function useTestWebhook() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => webhookService.testWebhook(id),
    onSuccess: () => {
      toast({
        title: 'Teste enviado',
        description: 'O webhook de teste foi enviado com sucesso.',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao testar webhook',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    },
  });
}

export function useToggleWebhook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => webhookService.toggleWebhook(id, is_active),
    onSuccess: (data: { is_active: boolean }) => {
      invalidateRelated.webhooks(queryClient);
      toast({
        title: data.is_active ? 'Webhook ativado' : 'Webhook desativado',
        description: `O webhook foi ${data.is_active ? 'ativado' : 'desativado'} com sucesso.`,
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao alterar status',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    },
  });
}
