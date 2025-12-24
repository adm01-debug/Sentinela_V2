import { ConnectionPool } from './pool';
import { PoolStats } from './types';

export class PoolMonitor {
  private history: { timestamp: Date; stats: PoolStats }[] = [];
  
  constructor(private pool: ConnectionPool) {}
  
  collect(): void {
    this.history.push({ timestamp: new Date(), stats: this.pool.getStats() });
    if (this.history.length > 1000) this.history.shift();
  }
  
  getAverageUtilization(minutes: number = 60): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recent = this.history.filter(h => h.timestamp.getTime() > cutoff);
    if (recent.length === 0) return 0;
    return recent.reduce((sum, h) => sum + (h.stats.inUse / h.stats.total), 0) / recent.length;
  }
  
  getPeakConnections(minutes: number = 60): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recent = this.history.filter(h => h.timestamp.getTime() > cutoff);
    return Math.max(0, ...recent.map(h => h.stats.inUse));
  }
  
  getAlerts(thresholds: { utilizationWarning: number; waitingWarning: number }): string[] {
    const stats = this.pool.getStats();
    const alerts: string[] = [];
    const utilization = stats.inUse / stats.total;
    
    if (utilization > thresholds.utilizationWarning) alerts.push('High pool utilization: ' + (utilization * 100).toFixed(1) + '%');
    if (stats.waiting > thresholds.waitingWarning) alerts.push('Connections waiting: ' + stats.waiting);
    
    return alerts;
  }
}