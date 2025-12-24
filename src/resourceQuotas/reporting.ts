import { QuotaManager } from './quota';
import { QuotaStatus } from './types';

export class QuotaReporter {
  constructor(private manager: QuotaManager) {}
  
  generateReport(namespace: string): QuotaReport {
    const quotas = this.manager.getForNamespace(namespace);
    const statuses = quotas.map(q => ({ name: q.name, status: this.manager.getStatus(q) }));
    
    return {
      namespace,
      quotaCount: quotas.length,
      exceeded: statuses.filter(s => s.status.exceeded).length,
      quotas: statuses,
      generatedAt: new Date()
    };
  }
  
  getAlerts(namespace: string, threshold: number = 80): QuotaAlert[] {
    const quotas = this.manager.getForNamespace(namespace);
    const alerts: QuotaAlert[] = [];
    
    quotas.forEach(q => {
      const status = this.manager.getStatus(q);
      status.resources.forEach(r => {
        if (r.percentage >= threshold) {
          alerts.push({ quota: q.name, resource: r.name, percentage: r.percentage, severity: r.percentage >= 100 ? 'critical' : 'warning' });
        }
      });
    });
    
    return alerts;
  }
}

export interface QuotaReport { namespace: string; quotaCount: number; exceeded: number; quotas: { name: string; status: QuotaStatus }[]; generatedAt: Date; }
export interface QuotaAlert { quota: string; resource: string; percentage: number; severity: 'warning' | 'critical'; }