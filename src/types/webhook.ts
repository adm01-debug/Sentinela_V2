// Webhook types for Sentinela v17

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  version: string;
  headers?: Record<string, string>;
  retryPolicy: RetryPolicy;
  filters?: WebhookFilter[];
  lastTriggeredAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type WebhookEvent = 
  | 'employee.created'
  | 'employee.updated'
  | 'employee.deleted'
  | 'activity.created'
  | 'activity.updated'
  | 'screenshot.captured'
  | 'alert.triggered'
  | 'alert.resolved'
  | 'report.generated'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'team.created'
  | 'team.updated'
  | 'violation.detected'
  | 'integration.connected'
  | 'integration.disconnected'
  | '*';

export type WebhookStatus = 'active' | 'paused' | 'failed' | 'disabled';

export interface RetryPolicy {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface WebhookFilter {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'contains';
  value: unknown;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  response?: WebhookResponse;
  status: DeliveryStatus;
  attempts: DeliveryAttempt[];
  duration?: number;
  createdAt: string;
  completedAt?: string;
}

export type DeliveryStatus = 'pending' | 'success' | 'failed' | 'retrying';

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  data: unknown;
  metadata: {
    webhookId: string;
    deliveryId: string;
    attempt: number;
  };
}

export interface WebhookResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
  duration: number;
}

export interface DeliveryAttempt {
  attempt: number;
  status: 'success' | 'failed';
  statusCode?: number;
  error?: string;
  duration: number;
  timestamp: string;
}

export interface WebhookCreateInput {
  name: string;
  url: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  retryPolicy?: Partial<RetryPolicy>;
  filters?: WebhookFilter[];
}

export interface WebhookUpdateInput {
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  headers?: Record<string, string>;
  retryPolicy?: Partial<RetryPolicy>;
  filters?: WebhookFilter[];
  isActive?: boolean;
}

export interface WebhookFilters {
  status?: WebhookStatus;
  event?: WebhookEvent;
  isActive?: boolean;
  search?: string;
}

export interface WebhookStats {
  total: number;
  active: number;
  deliveriesTotal: number;
  deliveriesSuccess: number;
  deliveriesFailed: number;
  averageResponseTime: number;
}

export interface WebhookTest {
  webhookId: string;
  event: WebhookEvent;
  payload?: unknown;
}
