import { HPA, HPAStatus } from './types';

export class HPAController {
  private hpas: Map<string, HPA> = new Map();
  private statuses: Map<string, HPAStatus> = new Map();
  
  create(hpa: HPA): void {
    this.hpas.set(this.key(hpa), hpa);
    this.statuses.set(this.key(hpa), { currentReplicas: hpa.minReplicas, desiredReplicas: hpa.minReplicas, currentMetrics: [] });
  }
  
  reconcile(namespace: string, name: string, currentMetrics: { cpu: number; memory: number }): ScaleDecision {
    const hpa = this.hpas.get(namespace + '/' + name);
    if (!hpa) return { scale: false, replicas: 0 };
    
    const status = this.statuses.get(namespace + '/' + name)!;
    const targetUtilization = hpa.metrics[0]?.resource?.target.averageUtilization ?? 80;
    
    const ratio = currentMetrics.cpu / targetUtilization;
    let desired = Math.ceil(status.currentReplicas * ratio);
    desired = Math.max(hpa.minReplicas, Math.min(hpa.maxReplicas, desired));
    
    status.desiredReplicas = desired;
    status.currentMetrics = [{ type: 'Resource', resource: { name: 'cpu', current: { averageUtilization: currentMetrics.cpu } } }];
    
    return { scale: desired !== status.currentReplicas, replicas: desired };
  }
  
  private key(hpa: HPA): string { return hpa.namespace + '/' + hpa.name; }
  getStatus(namespace: string, name: string): HPAStatus | undefined { return this.statuses.get(namespace + '/' + name); }
}

export interface ScaleDecision { scale: boolean; replicas: number; }