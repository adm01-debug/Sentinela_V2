// Integration types for Sentinela v17

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  config: IntegrationConfig;
  credentials?: IntegrationCredentials;
  metadata: IntegrationMetadata;
  permissions: string[];
  lastSyncAt?: string;
  lastErrorAt?: string;
  lastError?: string;
  syncFrequency?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type IntegrationType = 
  | 'communication'
  | 'storage'
  | 'calendar'
  | 'project_management'
  | 'hr'
  | 'identity'
  | 'analytics'
  | 'notification'
  | 'custom';

export type IntegrationProvider = 
  | 'slack'
  | 'teams'
  | 'google_workspace'
  | 'microsoft_365'
  | 'jira'
  | 'asana'
  | 'trello'
  | 'github'
  | 'gitlab'
  | 'okta'
  | 'azure_ad'
  | 'salesforce'
  | 'hubspot'
  | 'zapier'
  | 'webhook'
  | 'custom';

export type IntegrationStatus = 
  | 'pending'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disconnected'
  | 'suspended';

export interface IntegrationConfig {
  webhookUrl?: string;
  apiEndpoint?: string;
  scopes?: string[];
  channels?: string[];
  syncOptions?: SyncOptions;
  mappings?: FieldMapping[];
  filters?: IntegrationFilter[];
  customSettings?: Record<string, unknown>;
}

export interface IntegrationCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  expiresAt?: string;
}

export interface IntegrationMetadata {
  version: string;
  capabilities: string[];
  rateLimits?: RateLimits;
  documentation?: string;
  supportEmail?: string;
}

export interface SyncOptions {
  enabled: boolean;
  direction: 'inbound' | 'outbound' | 'bidirectional';
  frequency: number;
  batchSize: number;
  retryAttempts: number;
}

export interface FieldMapping {
  source: string;
  target: string;
  transform?: string;
  required: boolean;
}

export interface IntegrationFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in';
  value: unknown;
}

export interface RateLimits {
  requestsPerMinute: number;
  requestsPerDay: number;
  concurrentRequests: number;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: 'sync' | 'webhook' | 'error' | 'auth';
  status: 'success' | 'failure' | 'pending';
  data?: Record<string, unknown>;
  error?: string;
  duration?: number;
  timestamp: string;
}

export interface IntegrationCreateInput {
  name: string;
  type: IntegrationType;
  provider: IntegrationProvider;
  config?: Partial<IntegrationConfig>;
  credentials?: Partial<IntegrationCredentials>;
}

export interface IntegrationUpdateInput {
  name?: string;
  config?: Partial<IntegrationConfig>;
  credentials?: Partial<IntegrationCredentials>;
  isActive?: boolean;
  syncFrequency?: number;
}

export interface IntegrationFilters {
  type?: IntegrationType;
  provider?: IntegrationProvider;
  status?: IntegrationStatus;
  isActive?: boolean;
  search?: string;
}

export interface IntegrationStats {
  total: number;
  active: number;
  byProvider: Record<IntegrationProvider, number>;
  byStatus: Record<IntegrationStatus, number>;
  recentEvents: IntegrationEvent[];
}
