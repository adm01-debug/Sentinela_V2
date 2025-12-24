export interface ServiceDefinition {
  name: string;
  version: string;
  endpoints: ServiceEndpoint[];
  metadata: Record<string, string>;
  tags: string[];
}

export interface ServiceEndpoint {
  protocol: 'http' | 'https' | 'grpc';
  host: string;
  port: number;
  path?: string;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  latency: number;
  details?: Record<string, unknown>;
}