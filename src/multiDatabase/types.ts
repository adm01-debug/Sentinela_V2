export interface DatabaseConfig {
  name: string;
  driver: 'postgres' | 'mysql' | 'sqlite' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  options?: Record<string, unknown>;
}

export interface ConnectionState {
  name: string;
  isConnected: boolean;
  activeQueries: number;
  lastUsed: Date;
}

export type DatabaseResolver = (context: ResolverContext) => string;

export interface ResolverContext {
  tenantId?: string;
  userId?: string;
  region?: string;
  operation?: 'read' | 'write';
}