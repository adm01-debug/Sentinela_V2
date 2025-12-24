import { Replica, ReplicationConfig } from './types';

export class ReplicaLoadBalancer {
  private index: number = 0;
  
  constructor(private config: ReplicationConfig) {}
  
  selectForRead(replicas: Replica[], primary?: Replica): Replica | undefined {
    const eligible = this.getEligibleReplicas(replicas);
    
    switch (this.config.readPreference) {
      case 'primary': return primary;
      case 'secondary': return this.roundRobin(eligible);
      case 'nearest': return this.selectNearest(eligible);
    }
  }
  
  private getEligibleReplicas(replicas: Replica[]): Replica[] {
    return replicas.filter(r => r.status === 'online' && r.lag <= this.config.maxLag);
  }
  
  private roundRobin(replicas: Replica[]): Replica | undefined {
    if (replicas.length === 0) return undefined;
    const replica = replicas[this.index % replicas.length];
    this.index++;
    return replica;
  }
  
  private selectNearest(replicas: Replica[]): Replica | undefined {
    if (replicas.length === 0) return undefined;
    return replicas.reduce((min, r) => r.lag < min.lag ? r : min);
  }
}