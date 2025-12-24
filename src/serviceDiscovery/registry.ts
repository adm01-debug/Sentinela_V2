// Service Registry
export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  metadata: Record<string, string>;
  status: "healthy" | "unhealthy" | "unknown";
  registeredAt: Date;
  lastHeartbeat: Date;
}

export interface ServiceRegistry {
  register(instance: ServiceInstance): Promise<void>;
  deregister(instanceId: string): Promise<void>;
  discover(serviceName: string): Promise<ServiceInstance[]>;
  heartbeat(instanceId: string): Promise<void>;
  watch(serviceName: string, callback: (instances: ServiceInstance[]) => void): () => void;
}

export class InMemoryServiceRegistry implements ServiceRegistry {
  private services: Map<string, Map<string, ServiceInstance>> = new Map();
  private watchers: Map<string, Set<(instances: ServiceInstance[]) => void>> = new Map();

  async register(instance: ServiceInstance): Promise<void> {
    if (!this.services.has(instance.name)) this.services.set(instance.name, new Map());
    instance.registeredAt = new Date();
    instance.lastHeartbeat = new Date();
    this.services.get(instance.name)!.set(instance.id, instance);
    this.notifyWatchers(instance.name);
  }

  async deregister(instanceId: string): Promise<void> {
    for (const [name, instances] of this.services) {
      if (instances.delete(instanceId)) this.notifyWatchers(name);
    }
  }

  async discover(serviceName: string): Promise<ServiceInstance[]> {
    const instances = this.services.get(serviceName);
    return instances ? Array.from(instances.values()).filter(i => i.status === "healthy") : [];
  }

  async heartbeat(instanceId: string): Promise<void> {
    for (const instances of this.services.values()) {
      const instance = instances.get(instanceId);
      if (instance) { instance.lastHeartbeat = new Date(); instance.status = "healthy"; }
    }
  }

  watch(serviceName: string, callback: (instances: ServiceInstance[]) => void): () => void {
    if (!this.watchers.has(serviceName)) this.watchers.set(serviceName, new Set());
    this.watchers.get(serviceName)!.add(callback);
    return () => this.watchers.get(serviceName)?.delete(callback);
  }

  private notifyWatchers(serviceName: string): void {
    const instances = Array.from(this.services.get(serviceName)?.values() || []);
    this.watchers.get(serviceName)?.forEach(cb => cb(instances));
  }
}
