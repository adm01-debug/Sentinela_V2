export interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
  validationQuery?: string;
}

export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  acquiredCount: number;
  releasedCount: number;
}

export interface ConnectionInfo {
  id: string;
  createdAt: Date;
  lastUsedAt: Date;
  useCount: number;
  isValid: boolean;
}