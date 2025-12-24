export interface ReplicaConfig {
  id: string;
  host: string;
  port: number;
  role: 'primary' | 'replica';
  weight: number;
  maxConnections: number;
}

export interface ReplicaStatus {
  id: string;
  isHealthy: boolean;
  lagSeconds: number;
  activeConnections: number;
  lastChecked: Date;
}

export interface ReplicationConfig {
  maxLagSeconds: number;
  healthCheckInterval: number;
  failoverEnabled: boolean;
}