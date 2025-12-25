/**
 * @fileoverview VPA recommender
 * @module @sentinela/core/vpa
 * @version 13.0.0
 */

import { VPA, Recommendation, ContainerRecommendation, Resources } from './types';

export class VPARecommender {
  private history: Map<string, ResourceSample[]> = new Map();
  
  recordSample(namespace: string, podName: string, containerName: string, cpu: number, memory: number): void {
    const key = namespace + '/' + podName + '/' + containerName;
    const samples = this.history.get(key) ?? [];
    samples.push({ cpu, memory, timestamp: new Date() });
    if (samples.length > 1000) samples.shift();
    this.history.set(key, samples);
  }
  
  recommend(vpa: VPA): Recommendation {
    const containerRecommendations: ContainerRecommendation[] = [];
    
    this.history.forEach((samples, key) => {
      if (!key.startsWith(vpa.namespace + '/')) return;
      const containerName = key.split('/')[2];
      
      const cpuValues = samples.map(s => s.cpu).sort((a, b) => a - b);
      const memValues = samples.map(s => s.memory).sort((a, b) => a - b);
      
      containerRecommendations.push({
        containerName,
        lowerBound: { cpu: this.percentile(cpuValues, 10) + 'm', memory: this.percentile(memValues, 10) + 'Mi' },
        target: { cpu: this.percentile(cpuValues, 90) + 'm', memory: this.percentile(memValues, 90) + 'Mi' },
        upperBound: { cpu: this.percentile(cpuValues, 99) + 'm', memory: this.percentile(memValues, 99) + 'Mi' }
      });
    });
    
    return { containerRecommendations };
  }
  
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(p / 100 * sorted.length) - 1;
    return Math.round(sorted[Math.max(0, index)] ?? 0);
  }
}

export interface ResourceSample { cpu: number; memory: number; timestamp: Date; }