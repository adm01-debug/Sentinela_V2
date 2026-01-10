import { supabase } from '@/integrations/supabase/client';

export type WebhookEvent = 
  | 'employee.created'
  | 'employee.updated'
  | 'employee.deleted'
  | 'violation.detected'
  | 'violation.resolved'
  | 'geofence.enter'
  | 'geofence.exit'
  | 'report.generated'
  | 'alert.triggered';

export type WebhookStatus = 'active' | 'inactive' | 'failed';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  headers?: Record<string, string>;
  status: WebhookStatus;
  last_triggered_at?: string;
  failure_count: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  response_status?: number;
  response_body?: string;
  success: boolean;
  duration_ms?: number;
  delivered_at: string;
}

export interface WebhookCreateData {
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  headers?: Record<string, string>;
  organization_id: string;
}

export const webhookService = {
  /**
   * Get all webhooks for an organization
   */
  async getAll(organizationId: string): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;
    return (data as Webhook[]) || [];
  },

  /**
   * Get webhook by ID
   */
  async getById(id: string): Promise<Webhook | null> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Webhook;
  },

  /**
   * Create a webhook
   */
  async create(webhook: WebhookCreateData): Promise<Webhook> {
    const { data, error } = await supabase
      .from('webhooks')
      .insert([{
        ...webhook,
        status: 'active',
        failure_count: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Webhook;
  },

  /**
   * Update a webhook
   */
  async update(id: string, updates: Partial<Webhook>): Promise<Webhook> {
    const { data, error } = await supabase
      .from('webhooks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Webhook;
  },

  /**
   * Delete a webhook
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle webhook status
   */
  async toggleStatus(id: string, status: WebhookStatus): Promise<Webhook> {
    return this.update(id, { status });
  },

  /**
   * Test a webhook by sending a test payload
   */
  async test(id: string): Promise<{ success: boolean; response?: string; error?: string }> {
    const webhook = await this.getById(id);
    if (!webhook) {
      return { success: false, error: 'Webhook not found' };
    }

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
        webhook_id: id,
      },
    };

    return this.deliver(webhook, 'employee.created' as WebhookEvent, testPayload);
  },

  /**
   * Deliver a webhook
   */
  async deliver(
    webhook: Webhook,
    event: WebhookEvent,
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    const startTime = Date.now();
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': new Date().toISOString(),
        ...(webhook.headers || {}),
      };

      // Add signature if secret is configured
      if (webhook.secret) {
        const signature = await this.generateSignature(JSON.stringify(payload), webhook.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const duration = Date.now() - startTime;
      const responseText = await response.text();

      // Record delivery
      await this.recordDelivery({
        webhook_id: webhook.id,
        event,
        payload,
        response_status: response.status,
        response_body: responseText.slice(0, 1000),
        success: response.ok,
        duration_ms: duration,
        delivered_at: new Date().toISOString(),
      });

      if (response.ok) {
        // Reset failure count on success
        if (webhook.failure_count > 0) {
          await this.update(webhook.id, {
            failure_count: 0,
            last_triggered_at: new Date().toISOString(),
          });
        } else {
          await this.update(webhook.id, {
            last_triggered_at: new Date().toISOString(),
          });
        }
        return { success: true, response: responseText };
      } else {
        await this.handleFailure(webhook);
        return { success: false, error: `HTTP ${response.status}: ${responseText}` };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failed delivery
      await this.recordDelivery({
        webhook_id: webhook.id,
        event,
        payload,
        success: false,
        duration_ms: duration,
        delivered_at: new Date().toISOString(),
      });

      await this.handleFailure(webhook);
      return { success: false, error: String(error) };
    }
  },

  /**
   * Handle webhook delivery failure
   */
  async handleFailure(webhook: Webhook): Promise<void> {
    const newFailureCount = webhook.failure_count + 1;
    const updates: Partial<Webhook> = {
      failure_count: newFailureCount,
      last_triggered_at: new Date().toISOString(),
    };

    // Disable webhook after 5 consecutive failures
    if (newFailureCount >= 5) {
      updates.status = 'failed';
    }

    await this.update(webhook.id, updates);
  },

  /**
   * Record a webhook delivery attempt
   */
  async recordDelivery(delivery: Omit<WebhookDelivery, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('webhook_deliveries')
      .insert([delivery]);

    if (error) console.error('Failed to record webhook delivery:', error);
  },

  /**
   * Get delivery history for a webhook
   */
  async getDeliveries(webhookId: string, limit = 50): Promise<WebhookDelivery[]> {
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as WebhookDelivery[]) || [];
  },

  /**
   * Generate HMAC signature for webhook payload
   */
  async generateSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return 'sha256=' + Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Trigger webhooks for an event
   */
  async triggerEvent(
    organizationId: string,
    event: WebhookEvent,
    payload: Record<string, unknown>
  ): Promise<void> {
    const webhooks = await this.getAll(organizationId);
    const activeWebhooks = webhooks.filter(
      w => w.status === 'active' && w.events.includes(event)
    );

    await Promise.all(
      activeWebhooks.map(webhook =>
        this.deliver(webhook, event, {
          event,
          timestamp: new Date().toISOString(),
          data: payload,
        })
      )
    );
  },

  /**
   * Get available webhook events
   */
  getAvailableEvents(): Array<{ event: WebhookEvent; description: string }> {
    return [
      { event: 'employee.created', description: 'When a new employee is created' },
      { event: 'employee.updated', description: 'When an employee is updated' },
      { event: 'employee.deleted', description: 'When an employee is deleted' },
      { event: 'violation.detected', description: 'When a new violation is detected' },
      { event: 'violation.resolved', description: 'When a violation is resolved' },
      { event: 'geofence.enter', description: 'When someone enters a geofence' },
      { event: 'geofence.exit', description: 'When someone exits a geofence' },
      { event: 'report.generated', description: 'When a report is generated' },
      { event: 'alert.triggered', description: 'When an alert is triggered' },
    ];
  },
};

export default webhookService;
