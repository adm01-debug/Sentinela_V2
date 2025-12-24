import { ServingConfig } from './types';

export class AutoScaler {
  private replicas: number = 1;
  private metrics: ScalingMetrics[] = [];
  
  constructor(private minReplicas: number, private maxReplicas: number, private targetLatency: number) {}
  
  recordMetrics(metrics: ScalingMetrics): void {
    this.metrics.push(metrics);
    if (this.metrics.length > 100) this.metrics.shift();
  }
  
  evaluate(): ScalingDecision {
    if (this.metrics.length < 10) return { action: 'none', replicas: this.replicas };
    
    const avgLatency = this.metrics.slice(-10).reduce((sum, m) => sum + m.latency, 0) / 10;
    const avgUtilization = this.metrics.slice(-10).reduce((sum, m) => sum + m.utilization, 0) / 10;
    
    if (avgLatency > this.targetLatency * 1.5 && this.replicas < this.maxReplicas) {
      this.replicas++;
      return { action: 'scale_up', replicas: this.replicas };
    }
    
    if (avgUtilization < 0.3 && this.replicas > this.minReplicas) {
      this.replicas--;
      return { action: 'scale_down', replicas: this.replicas };
    }
    
    return { action: 'none', replicas: this.replicas };
  }
}

export interface ScalingMetrics { latency: number; utilization: number; queueSize: number; timestamp: Date; }
export interface ScalingDecision { action: 'scale_up' | 'scale_down' | 'none'; replicas: number; }