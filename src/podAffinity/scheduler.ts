import { PodAffinity, Pod } from './types';
import { PodAffinityMatcher } from './matcher';
import { AntiAffinityChecker } from './antiAffinity';

export class PodAffinityScheduler {
  private matcher = new PodAffinityMatcher();
  private antiAffinityChecker = new AntiAffinityChecker();
  
  scoreNode(nodeName: string, candidate: Pod, existingPods: Pod[], affinity?: PodAffinity, nodeTopologies: Map<string, Record<string, string>> = new Map()): number {
    let score = 0;
    
    if (affinity?.preferredDuringSchedulingIgnoredDuringExecution) {
      for (const weighted of affinity.preferredDuringSchedulingIgnoredDuringExecution) {
        const matchingPods = this.matcher.findMatchingPods(existingPods, weighted.podAffinityTerm.labelSelector);
        const colocated = matchingPods.filter(p => this.isColocated(nodeName, p.nodeName, weighted.podAffinityTerm.topologyKey, nodeTopologies));
        if (colocated.length > 0) score += weighted.weight;
      }
    }
    
    return score;
  }
  
  private isColocated(node1: string, node2: string | undefined, topologyKey: string, nodeTopologies: Map<string, Record<string, string>>): boolean {
    if (!node2) return false;
    const labels1 = nodeTopologies.get(node1);
    const labels2 = nodeTopologies.get(node2);
    return labels1?.[topologyKey] === labels2?.[topologyKey];
  }
  
  filterNodes(nodes: string[], candidate: Pod, existingPods: Pod[], antiAffinity?: PodAffinity, nodeTopologies: Map<string, Record<string, string>> = new Map()): string[] {
    return nodes.filter(node => {
      const testPod = { ...candidate, nodeName: node };
      const result = this.antiAffinityChecker.checkAntiAffinity(testPod, existingPods, antiAffinity, nodeTopologies);
      return result.canSchedule;
    });
  }
}