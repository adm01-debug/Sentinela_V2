// Service Load Balancer
import { ServiceInstance, ServiceRegistry } from "./registry";

export type LoadBalancerStrategy = "round-robin" | "random" | "least-connections" | "weighted";

export interface LoadBalancer {
  getInstance(serviceName: string): Promise<ServiceInstance | null>;
}

export class RoundRobinLoadBalancer implements LoadBalancer {
  private counters: Map<string, number> = new Map();
  constructor(private registry: ServiceRegistry) {}

  async getInstance(serviceName: string): Promise<ServiceInstance | null> {
    const instances = await this.registry.discover(serviceName);
    if (instances.length === 0) return null;
    const counter = (this.counters.get(serviceName) || 0) % instances.length;
    this.counters.set(serviceName, counter + 1);
    return instances[counter];
  }
}

export class RandomLoadBalancer implements LoadBalancer {
  constructor(private registry: ServiceRegistry) {}
  async getInstance(serviceName: string): Promise<ServiceInstance | null> {
    const instances = await this.registry.discover(serviceName);
    if (instances.length === 0) return null;
    return instances[Math.floor(Math.random() * instances.length)];
  }
}

export class WeightedLoadBalancer implements LoadBalancer {
  constructor(private registry: ServiceRegistry) {}
  async getInstance(serviceName: string): Promise<ServiceInstance | null> {
    const instances = await this.registry.discover(serviceName);
    if (instances.length === 0) return null;
    const weights = instances.map(i => parseInt(i.metadata.weight || "1"));
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < instances.length; i++) {
      random -= weights[i];
      if (random <= 0) return instances[i];
    }
    return instances[0];
  }
}
