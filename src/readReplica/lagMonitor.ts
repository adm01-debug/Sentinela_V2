import { Replica } from './types';
import { ReplicaManager } from './replicaManager';

export class LagMonitor {
  private alerts: Alert[] = [];
  
  constructor(private manager: ReplicaManager, private maxLag: number) {}
  
  async checkLag(): Promise<LagReport> {
    const replicas = this.manager.getReadReplicas();
    const report: LagReport = { timestamp: new Date(), replicas: [], alerts: [] };
    
    for (const replica of replicas) {
      report.replicas.push({ id: replica.id, lag: replica.lag, status: replica.status });
      if (replica.lag > this.maxLag) {
        const alert: Alert = { replicaId: replica.id, lag: replica.lag, threshold: this.maxLag, timestamp: new Date() };
        report.alerts.push(alert);
        this.alerts.push(alert);
        this.manager.updateStatus(replica.id, 'lagging');
      }
    }
    
    return report;
  }
  
  getRecentAlerts(minutes: number = 60): Alert[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.alerts.filter(a => a.timestamp.getTime() > cutoff);
  }
}

export interface LagReport { timestamp: Date; replicas: { id: string; lag: number; status: string }[]; alerts: Alert[]; }
export interface Alert { replicaId: string; lag: number; threshold: number; timestamp: Date; }