export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, unknown>;
  lastSync?: string;
  errorMessage?: string;
}

export type IntegrationType =
  | 'slack'
  | 'teams'
  | 'jira'
  | 'github'
  | 'google_workspace'
  | 'azure_ad'
  | 'okta'
  | 'custom_webhook';

export interface IntegrationConfig {
  apiKey?: string;
  webhookUrl?: string;
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  scopes?: string[];
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
}
