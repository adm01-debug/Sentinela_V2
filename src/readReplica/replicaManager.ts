import { ReplicaConfig, ReplicaStatus } from './types';

export class ReplicaManager {
  private replicas: Map<string, ReplicaConfig> = new Map();
  private status: Map<string, ReplicaStatus> = new Map();
  private primary?: string;
  
  addReplica(config: ReplicaConfig): void {
    this.replicas.set(config.id, config);
    if (config.role === 'primary') this.primary = config.id;
    this.status.set(config.id, { id: config.id, isHealthy: true, lagSeconds: 0, activeConnections: 0, lastChecked: new Date() });
  }
  
  removeReplica(id: string): void { this.replicas.delete(id); this.status.delete(id); }
  
  getPrimary(): ReplicaConfig | undefined { return this.primary ? this.replicas.get(this.primary) : undefined; }
  
  getReplicas(): ReplicaConfig[] { return Array.from(this.replicas.values()).filter(r => r.role === 'replica'); }
  
  getHealthyReplicas(maxLagSeconds: number = 10): ReplicaConfig[] {
    return this.getReplicas().filter(r => {
      const s = this.status.get(r.id);
      return s?.isHealthy && s.lagSeconds <= maxLagSeconds;
    });
  }
  
  updateStatus(id: string, status: Partial<ReplicaStatus>): void {
    const current = this.status.get(id);
    if (current) this.status.set(id, { ...current, ...status, lastChecked: new Date() });
  }
  
  getStatus(id: string): ReplicaStatus | undefined { return this.status.get(id); }
  getAllStatus(): ReplicaStatus[] { return Array.from(this.status.values()); }
}