export interface ServiceDefinition {
  name: string;
  version: string;
  endpoints: EndpointDefinition[];
  metadata: Record<string, string>;
  healthCheck: HealthCheckConfig;
}

export interface EndpointDefinition {
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc';
  weight: number;
}

export interface HealthCheckConfig {
  endpoint: string;
  interval: number;
  timeout: number;
  unhealthyThreshold: number;
}