import { supabase } from '@/integrations/supabase/client';
import type { Webhook, WebhookLog, CreateWebhookInput, UpdateWebhookInput } from '@/hooks/useWebhooks';

export const webhookService = {
  async getWebhooks() {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Webhook[];
  },

  async getWebhookById(id: string) {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Webhook;
  },

  async getWebhookLogs(webhookId: string) {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data as WebhookLog[];
  },

  async createWebhook(input: CreateWebhookInput) {
    const { data, error } = await supabase
      .from('webhooks')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWebhook(id: string, input: Partial<UpdateWebhookInput>) {
    const { data, error } = await supabase
      .from('webhooks')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWebhook(id: string) {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async testWebhook(id: string) {
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

  async toggleWebhook(id: string, is_active: boolean) {
    const { data, error } = await supabase
      .from('webhooks')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default webhookService;
