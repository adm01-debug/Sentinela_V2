export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

export type WebhookEvent = 
  | 'violation.created'
  | 'employee.status_changed'
  | 'report.generated'
  | 'alert.triggered'
  | 'policy.updated';

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  statusCode: number;
  success: boolean;
  createdAt: string;
  duration: number;
}

export interface CreateWebhookInput {
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
}
