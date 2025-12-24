export interface ServiceDefinition {
  name: string;
  version: string;
  endpoints: EndpointDefinition[];
  metadata: Record<string, string>;
  healthCheck: HealthCheckConfig;
}

export interface EndpointDefinition {
  protocol: 'http' | 'https' | 'grpc';
  host: string;
  port: number;
  path?: string;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  endpoint: string;
}

export interface ServiceRegistration {
  id: string;
  service: ServiceDefinition;
  status: RegistrationStatus;
  registeredAt: Date;
  lastHeartbeat: Date;
}

export enum RegistrationStatus { Active = 'active', Inactive = 'inactive', Draining = 'draining' }