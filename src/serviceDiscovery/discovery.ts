/**
 * @fileoverview Service Discovery implementation
 * @module @sentinela/core/serviceDiscovery
 * @version 13.0.0
 */

export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  metadata?: Record<string, string>;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  registeredAt: Date;
}

export interface ServiceRegistration {
  name: string;
  host: string;
  port: number;
  metadata?: Record<string, string>;
}

export class ServiceDiscovery {
  private services = new Map<string, ServiceInstance[]>();
  private idCounter = 0;

  async register(registration: ServiceRegistration): Promise<string> {
    const id = 'svc_' + (++this.idCounter);
    const instance: ServiceInstance = {
      id,
      ...registration,
      healthStatus: 'healthy',
      registeredAt: new Date()
    };

    const instances = this.services.get(registration.name) ?? [];
    instances.push(instance);
    this.services.set(registration.name, instances);
    return id;
  }

  async deregister(instanceId: string): Promise<void> {
    for (const [name, instances] of this.services) {
      this.services.set(name, instances.filter(i => i.id !== instanceId));
    }
  }

  async find(serviceName: string): Promise<ServiceInstance[]> {
    return (this.services.get(serviceName) ?? []).filter(i => i.healthStatus === 'healthy');
  }

  async findOne(serviceName: string): Promise<ServiceInstance | undefined> {
    const instances = await this.find(serviceName);
    if (instances.length === 0) return undefined;
    return instances[Math.floor(Math.random() * instances.length)];
  }

  async updateHealth(instanceId: string, status: ServiceInstance['healthStatus']): Promise<void> {
    for (const instances of this.services.values()) {
      const instance = instances.find(i => i.id === instanceId);
      if (instance) instance.healthStatus = status;
    }
  }
}
