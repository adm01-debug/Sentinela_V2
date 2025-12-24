import { DeadLetterQueue } from './queue';

export class DLQMonitor {
  constructor(private queue: DeadLetterQueue) {}
  
  getStats(): DLQStats {
    const messages = this.queue.getAll();
    const byTopic: Record<string, number> = {};
    let totalRetries = 0;
    
    messages.forEach(m => {
      byTopic[m.originalTopic] = (byTopic[m.originalTopic] ?? 0) + 1;
      totalRetries += m.retryCount;
    });
    
    return {
      totalMessages: messages.length,
      byTopic,
      avgRetryCount: messages.length ? totalRetries / messages.length : 0,
      oldestMessage: messages.length ? messages.reduce((a, b) => a.failedAt < b.failedAt ? a : b).failedAt : null
    };
  }
  
  getAlerts(thresholds: AlertThresholds): Alert[] {
    const stats = this.getStats();
    const alerts: Alert[] = [];
    
    if (stats.totalMessages > thresholds.maxQueueSize) {
      alerts.push({ level: 'critical', message: 'DLQ size exceeds threshold: ' + stats.totalMessages });
    }
    if (stats.avgRetryCount > thresholds.maxAvgRetries) {
      alerts.push({ level: 'warning', message: 'High average retry count: ' + stats.avgRetryCount.toFixed(2) });
    }
    
    return alerts;
  }
}

export interface DLQStats { totalMessages: number; byTopic: Record<string, number>; avgRetryCount: number; oldestMessage: Date | null; }
export interface AlertThresholds { maxQueueSize: number; maxAvgRetries: number; }
export interface Alert { level: 'warning' | 'critical'; message: string; }