import { ReplicaManager } from './replicaManager';
import { ReplicationConfig } from './types';

export class ReplicationLagMonitor {
  private timer?: NodeJS.Timeout;
  private alerts: LagAlert[] = [];
  
  constructor(private manager: ReplicaManager, private config: ReplicationConfig) {}
  
  start(): void {
    this.timer = setInterval(() => this.checkLag(), this.config.healthCheckInterval);
  }
  
  stop(): void { if (this.timer) clearInterval(this.timer); }
  
  private async checkLag(): Promise<void> {
    for (const replica of this.manager.getReplicas()) {
      const lag = await this.measureLag(replica.id);
      this.manager.updateStatus(replica.id, { lagSeconds: lag, isHealthy: lag <= this.config.maxLagSeconds });
      if (lag > this.config.maxLagSeconds) {
        this.alerts.push({ replicaId: replica.id, lagSeconds: lag, timestamp: new Date() });
        console.warn('Replica lag alert:', replica.id, lag, 'seconds');
      }
    }
  }
  
  private async measureLag(replicaId: string): Promise<number> { return Math.random() * 5; }
  
  getAlerts(since?: Date): LagAlert[] {
    return since ? this.alerts.filter(a => a.timestamp >= since) : [...this.alerts];
  }
  
  clearAlerts(): void { this.alerts = []; }
}

export interface LagAlert { replicaId: string; lagSeconds: number; timestamp: Date; }