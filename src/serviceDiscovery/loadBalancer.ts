import { ServiceInstance } from './types';

export interface LoadBalancer {
  select(instances: ServiceInstance[]): ServiceInstance | null;
}

export class RoundRobinLoadBalancer implements LoadBalancer {
  private counters: Map<string, number> = new Map();
  
  select(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;
    const key = instances[0].name;
    const index = (this.counters.get(key) ?? 0) % instances.length;
    this.counters.set(key, index + 1);
    return instances[index];
  }
}

export class RandomLoadBalancer implements LoadBalancer {
  select(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;
    return instances[Math.floor(Math.random() * instances.length)];
  }
}

export class WeightedLoadBalancer implements LoadBalancer {
  select(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;
    const weights = instances.map(i => parseInt(i.metadata.weight ?? '1'));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < instances.length; i++) {
      random -= weights[i];
      if (random <= 0) return instances[i];
    }
    return instances[0];
  }
}