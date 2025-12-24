import { ServiceManager } from './service';

export class AutoScaler {
  private rules: Map<string, ScalingRule> = new Map();
  
  constructor(private serviceManager: ServiceManager) {}
  
  setRule(serviceName: string, rule: ScalingRule): void { this.rules.set(serviceName, rule); }
  
  evaluate(serviceName: string, metrics: ScalingMetrics): ScalingDecision {
    const rule = this.rules.get(serviceName);
    if (!rule) return { action: 'none', targetReplicas: 0 };
    
    const service = this.serviceManager.getService(serviceName);
    if (!service) return { action: 'none', targetReplicas: 0 };
    
    const current = service.service.replicas;
    
    if (metrics.cpuUtilization > rule.scaleUpThreshold && current < rule.maxReplicas) {
      return { action: 'scale_up', targetReplicas: Math.min(current + 1, rule.maxReplicas) };
    }
    
    if (metrics.cpuUtilization < rule.scaleDownThreshold && current > rule.minReplicas) {
      return { action: 'scale_down', targetReplicas: Math.max(current - 1, rule.minReplicas) };
    }
    
    return { action: 'none', targetReplicas: current };
  }
}

export interface ScalingRule { minReplicas: number; maxReplicas: number; scaleUpThreshold: number; scaleDownThreshold: number; }
export interface ScalingMetrics { cpuUtilization: number; memoryUtilization: number; requestRate: number; }
export interface ScalingDecision { action: 'scale_up' | 'scale_down' | 'none'; targetReplicas: number; }