import { VPA, Recommendation } from './types';

export class VPAAdmissionController {
  private vpas: Map<string, VPA> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  
  registerVPA(vpa: VPA): void { this.vpas.set(vpa.namespace + '/' + vpa.name, vpa); }
  setRecommendation(namespace: string, name: string, rec: Recommendation): void { this.recommendations.set(namespace + '/' + name, rec); }
  
  mutate(podSpec: PodSpec, namespace: string, ownerName: string): PodSpec {
    const vpa = this.findVPA(namespace, ownerName);
    if (!vpa || vpa.updatePolicy.updateMode === 'Off') return podSpec;
    
    const recommendation = this.recommendations.get(namespace + '/' + vpa.name);
    if (!recommendation) return podSpec;
    
    const mutated = { ...podSpec, containers: podSpec.containers.map(container => {
      const rec = recommendation.containerRecommendations.find(r => r.containerName === container.name);
      if (!rec) return container;
      return { ...container, resources: { requests: rec.target, limits: rec.upperBound } };
    })};
    
    return mutated;
  }
  
  private findVPA(namespace: string, ownerName: string): VPA | undefined {
    return Array.from(this.vpas.values()).find(v => v.namespace === namespace && v.targetRef.name === ownerName);
  }
}

export interface PodSpec { containers: { name: string; resources?: { requests?: { cpu?: string; memory?: string }; limits?: { cpu?: string; memory?: string } } }[]; }