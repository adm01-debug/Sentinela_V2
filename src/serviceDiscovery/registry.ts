import { ServiceInstance, ServiceRegistry, HealthStatus } from './types';

export class InMemoryServiceRegistry implements ServiceRegistry {
  private instances: Map<string, ServiceInstance> = new Map();
  private healthCheckInterval: number;
  private timer?: NodeJS.Timeout;
  
  constructor(healthCheckIntervalMs: number = 30000) {
    this.healthCheckInterval = healthCheckIntervalMs;
    this.startHealthCheck();
  }
  
  async register(instance: ServiceInstance): Promise<void> {
    this.instances.set(instance.id, { ...instance, registeredAt: new Date(), lastHeartbeat: new Date() });
  }
  
  async deregister(instanceId: string): Promise<void> { this.instances.delete(instanceId); }
  
  async getInstances(serviceName: string): Promise<ServiceInstance[]> {
    return Array.from(this.instances.values())
      .filter(i => i.name === serviceName && i.healthStatus === HealthStatus.Healthy);
  }
  
  async heartbeat(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (instance) { instance.lastHeartbeat = new Date(); instance.healthStatus = HealthStatus.Healthy; }
  }
  
  private startHealthCheck(): void {
    this.timer = setInterval(() => {
      const now = Date.now();
      this.instances.forEach(instance => {
        if (now - instance.lastHeartbeat.getTime() > this.healthCheckInterval * 2) {
          instance.healthStatus = HealthStatus.Unhealthy;
        }
      });
    }, this.healthCheckInterval);
  }
  
  stop(): void { if (this.timer) clearInterval(this.timer); }
}