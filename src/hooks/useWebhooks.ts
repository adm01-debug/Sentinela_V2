import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  headers: Record<string, string>;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  last_triggered_at: string | null;
  last_status: string | null;
  last_response_code: number | null;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, any>;
  response_code: number | null;
  response_body: string | null;
  error_message: string | null;
  duration_ms: number | null;
  attempt_number: number;
  status: string;
  created_at: string;
}

export const WEBHOOK_EVENTS = [
  { value: 'violation.created', label: 'Nova Violação', description: 'Quando uma nova violação de segurança é detectada' },
  { value: 'violation.critical', label: 'Violação Crítica', description: 'Quando uma violação crítica é detectada' },
  { value: 'employee.created', label: 'Novo Funcionário', description: 'Quando um novo funcionário é cadastrado' },
  { value: 'employee.updated', label: 'Funcionário Atualizado', description: 'Quando dados de funcionário são atualizados' },
  { value: 'geofence.violation', label: 'Violação de Geofence', description: 'Quando um funcionário sai da área permitida' },
  { value: 'overtime.requested', label: 'Hora Extra Solicitada', description: 'Quando uma hora extra é solicitada' },
  { value: 'overtime.approved', label: 'Hora Extra Aprovada', description: 'Quando uma hora extra é aprovada' },
  { value: 'policy.acknowledged', label: 'Política Aceita', description: 'Quando um funcionário aceita uma política' },
  { value: 'rate_limit.exceeded', label: 'Rate Limit Excedido', description: 'Quando um rate limit é excedido' },
  { value: 'report.generated', label: 'Relatório Gerado', description: 'Quando um relatório é gerado' },
];

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const { toast } = useToast();

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since we know the structure matches
      setWebhooks((data || []) as unknown as Webhook[]);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os webhooks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (webhookId?: string) => {
    setLogsLoading(true);
    try {
      let query = supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (webhookId) {
        query = query.eq('webhook_id', webhookId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as unknown as WebhookLog[]);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const createWebhook = async (webhook: Omit<Webhook, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'last_triggered_at' | 'last_status' | 'last_response_code'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          ...webhook,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Webhook criado com sucesso',
      });

      await fetchWebhooks();
      return data;
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o webhook',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateWebhook = async (id: string, updates: Partial<Webhook>) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Webhook atualizado com sucesso',
      });

      await fetchWebhooks();
      return true;
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o webhook',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Webhook excluído com sucesso',
      });

      await fetchWebhooks();
      return true;
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o webhook',
        variant: 'destructive',
      });
      return false;
    }
  };

  const testWebhook = async (webhookId: string, eventType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-webhook', {
        body: {
          event_type: eventType,
          webhook_id: webhookId,
          test_mode: true,
          data: {
            test: true,
            message: 'Este é um teste de webhook',
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      const result = data.results?.[0];
      if (result?.success) {
        toast({
          title: 'Teste bem-sucedido',
          description: `Webhook respondeu com status ${result.statusCode}`,
        });
      } else {
        toast({
          title: 'Teste falhou',
          description: result?.error || 'O webhook não respondeu corretamente',
          variant: 'destructive',
        });
      }

      await fetchWebhooks();
      return data;
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível testar o webhook',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  return {
    webhooks,
    logs,
    loading,
    logsLoading,
    fetchWebhooks,
    fetchLogs,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  };
}
