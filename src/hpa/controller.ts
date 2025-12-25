/**
 * @fileoverview HPA Controller
 * @module @sentinela/core/hpa
 */
export interface HPAConfig { minReplicas: number; maxReplicas: number; targetCPU: number; }
export class HPAController {
  private currentReplicas: number;
  private metrics = { cpu: 0, memory: 0 };
  constructor(private config: HPAConfig) { this.currentReplicas = config.minReplicas; }
  updateMetrics(m: { cpu: number; memory: number }): void { this.metrics = m; }
  async evaluate(): Promise<{ action: string; replicas: number }> {
    if (this.metrics.cpu > this.config.targetCPU && this.currentReplicas < this.config.maxReplicas) {
      this.currentReplicas++;
      return { action: 'scale-up', replicas: this.currentReplicas };
    }
    if (this.metrics.cpu < this.config.targetCPU * 0.5 && this.currentReplicas > this.config.minReplicas) {
      this.currentReplicas--;
      return { action: 'scale-down', replicas: this.currentReplicas };
    }
    return { action: 'none', replicas: this.currentReplicas };
  }
}
