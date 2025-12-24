// Service Discovery Client
import { ServiceInstance, ServiceRegistry, InMemoryServiceRegistry } from "./registry";
import { LoadBalancer, RoundRobinLoadBalancer } from "./loadBalancer";

export interface ServiceDiscoveryClient {
  register(name: string, host: string, port: number, metadata?: Record<string, string>): Promise<string>;
  deregister(instanceId: string): Promise<void>;
  discover(serviceName: string): Promise<ServiceInstance | null>;
  discoverAll(serviceName: string): Promise<ServiceInstance[]>;
}

export class DefaultServiceDiscoveryClient implements ServiceDiscoveryClient {
  private registry: ServiceRegistry;
  private loadBalancer: LoadBalancer;
  private heartbeatInterval?: NodeJS.Timeout;
  private registeredInstances: Set<string> = new Set();

  constructor(registry?: ServiceRegistry, loadBalancer?: LoadBalancer) {
    this.registry = registry || new InMemoryServiceRegistry();
    this.loadBalancer = loadBalancer || new RoundRobinLoadBalancer(this.registry);
  }

  async register(name: string, host: string, port: number, metadata: Record<string, string> = {}): Promise<string> {
    const id = crypto.randomUUID();
    const instance: ServiceInstance = {
      id, name, host, port, metadata, status: "healthy",
      registeredAt: new Date(), lastHeartbeat: new Date()
    };
    await this.registry.register(instance);
    this.registeredInstances.add(id);
    this.startHeartbeat(id);
    return id;
  }

  async deregister(instanceId: string): Promise<void> {
    await this.registry.deregister(instanceId);
    this.registeredInstances.delete(instanceId);
  }

  async discover(serviceName: string): Promise<ServiceInstance | null> {
    return this.loadBalancer.getInstance(serviceName);
  }

  async discoverAll(serviceName: string): Promise<ServiceInstance[]> {
    return this.registry.discover(serviceName);
  }

  private startHeartbeat(instanceId: string): void {
    this.heartbeatInterval = setInterval(() => {
      this.registry.heartbeat(instanceId);
    }, 5000);
  }

  shutdown(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    for (const id of this.registeredInstances) this.deregister(id);
  }
}
