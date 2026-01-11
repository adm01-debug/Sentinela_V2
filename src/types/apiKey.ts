// API Key types for Sentinela v17

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  keyHash: string;
  type: ApiKeyType;
  status: ApiKeyStatus;
  scopes: ApiScope[];
  permissions: string[];
  rateLimit: RateLimit;
  ipWhitelist?: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  revokedAt?: string;
  revokedBy?: string;
}

export type ApiKeyType = 'live' | 'test' | 'restricted';

export type ApiKeyStatus = 'active' | 'expired' | 'revoked' | 'suspended';

export type ApiScope = 
  | 'employees:read'
  | 'employees:write'
  | 'activities:read'
  | 'activities:write'
  | 'screenshots:read'
  | 'screenshots:write'
  | 'alerts:read'
  | 'alerts:write'
  | 'reports:read'
  | 'reports:write'
  | 'users:read'
  | 'users:write'
  | 'teams:read'
  | 'teams:write'
  | 'settings:read'
  | 'settings:write'
  | 'webhooks:read'
  | 'webhooks:write'
  | 'analytics:read'
  | 'billing:read'
  | 'billing:write'
  | '*';

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface ApiKeyUsage {
  keyId: string;
  period: { start: string; end: string };
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitHits: number;
  byEndpoint: EndpointUsage[];
  byStatus: Record<number, number>;
}

export interface EndpointUsage {
  endpoint: string;
  method: string;
  count: number;
  averageLatency: number;
}

export interface ApiKeyCreateInput {
  name: string;
  type?: ApiKeyType;
  scopes: ApiScope[];
  rateLimit?: Partial<RateLimit>;
  ipWhitelist?: string[];
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ApiKeyUpdateInput {
  name?: string;
  scopes?: ApiScope[];
  rateLimit?: Partial<RateLimit>;
  ipWhitelist?: string[];
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ApiKeyFilters {
  type?: ApiKeyType;
  status?: ApiKeyStatus;
  scope?: ApiScope;
  createdBy?: string;
  search?: string;
}

export interface ApiKeyStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  totalRequests: number;
  averageRequestsPerDay: number;
}

export interface ApiKeyRotation {
  oldKeyId: string;
  newKeyId: string;
  gracePeriod: number;
  rotatedAt: string;
}
