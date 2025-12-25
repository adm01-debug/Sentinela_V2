/**
 * @fileoverview Service discovery types
 * @module @sentinela/core/serviceDiscovery
 * @version 13.0.0
 */

export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  metadata: Record<string, string>;
  healthStatus: HealthStatus;
  registeredAt: Date;
  lastHeartbeat: Date;
}

export enum HealthStatus { Healthy = 'healthy', Unhealthy = 'unhealthy', Unknown = 'unknown' }

export interface ServiceRegistry {
  register(instance: ServiceInstance): Promise<void>;
  deregister(instanceId: string): Promise<void>;
  getInstances(serviceName: string): Promise<ServiceInstance[]>;
  heartbeat(instanceId: string): Promise<void>;
}