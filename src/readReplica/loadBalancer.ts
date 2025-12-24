import { ReplicaConfig } from './types';
import { ReplicaManager } from './replicaManager';

export class ReplicaLoadBalancer {
  private currentIndex: number = 0;
  
  constructor(private manager: ReplicaManager, private strategy: 'round-robin' | 'least-connections' | 'weighted' = 'round-robin') {}
  
  getReadReplica(): ReplicaConfig | undefined {
    const replicas = this.manager.getHealthyReplicas();
    if (replicas.length === 0) return this.manager.getPrimary();
    switch (this.strategy) {
      case 'round-robin': return this.roundRobin(replicas);
      case 'least-connections': return this.leastConnections(replicas);
      case 'weighted': return this.weighted(replicas);
    }
  }
  
  getWriteReplica(): ReplicaConfig | undefined { return this.manager.getPrimary(); }
  
  private roundRobin(replicas: ReplicaConfig[]): ReplicaConfig {
    const replica = replicas[this.currentIndex % replicas.length];
    this.currentIndex++;
    return replica;
  }
  
  private leastConnections(replicas: ReplicaConfig[]): ReplicaConfig {
    return replicas.reduce((min, r) => {
      const minConn = this.manager.getStatus(min.id)?.activeConnections ?? 0;
      const rConn = this.manager.getStatus(r.id)?.activeConnections ?? 0;
      return rConn < minConn ? r : min;
    });
  }
  
  private weighted(replicas: ReplicaConfig[]): ReplicaConfig {
    const totalWeight = replicas.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const r of replicas) { random -= r.weight; if (random <= 0) return r; }
    return replicas[0];
  }
}