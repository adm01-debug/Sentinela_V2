import { PodAffinity, PodAffinityTerm, Pod } from './types';
import { PodAffinityMatcher } from './matcher';

export class AntiAffinityChecker {
  private matcher = new PodAffinityMatcher();
  
  checkAntiAffinity(candidate: Pod, existingPods: Pod[], antiAffinity?: PodAffinity, nodeTopologies: Map<string, Record<string, string>> = new Map()): AntiAffinityResult {
    if (!antiAffinity?.requiredDuringSchedulingIgnoredDuringExecution) {
      return { canSchedule: true, conflicts: [] };
    }
    
    const conflicts: string[] = [];
    
    for (const term of antiAffinity.requiredDuringSchedulingIgnoredDuringExecution) {
      const matchingPods = this.matcher.findMatchingPods(existingPods, term.labelSelector, term.namespaces);
      
      for (const pod of matchingPods) {
        if (this.sameTopology(candidate, pod, term.topologyKey, nodeTopologies)) {
          conflicts.push(pod.name);
        }
      }
    }
    
    return { canSchedule: conflicts.length === 0, conflicts };
  }
  
  private sameTopology(pod1: Pod, pod2: Pod, topologyKey: string, nodeTopologies: Map<string, Record<string, string>>): boolean {
    if (!pod1.nodeName || !pod2.nodeName) return false;
    const labels1 = nodeTopologies.get(pod1.nodeName);
    const labels2 = nodeTopologies.get(pod2.nodeName);
    return labels1?.[topologyKey] === labels2?.[topologyKey];
  }
}

export interface AntiAffinityResult { canSchedule: boolean; conflicts: string[]; }