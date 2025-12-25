/**
 * @fileoverview VPA Recommender
 * @module @sentinela/core/vpa
 */
export interface ResourceRecommendation { cpu: string; memory: string; }
export class VPARecommender {
  private samples: Array<{ cpu: number; memory: number }> = [];
  addSample(cpu: number, memory: number): void { this.samples.push({ cpu, memory }); }
  recommend(): ResourceRecommendation {
    if (this.samples.length === 0) return { cpu: '100m', memory: '128Mi' };
    const avgCpu = this.samples.reduce((a, s) => a + s.cpu, 0) / this.samples.length;
    const avgMem = this.samples.reduce((a, s) => a + s.memory, 0) / this.samples.length;
    return { cpu: Math.ceil(avgCpu * 1.2) + 'm', memory: Math.ceil(avgMem * 1.2) + 'Mi' };
  }
}
