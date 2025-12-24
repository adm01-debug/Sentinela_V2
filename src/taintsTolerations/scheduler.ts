import { Node, Toleration, Taint } from './types';
import { TolerationMatcher } from './tolerationMatcher';

export class TaintBasedScheduler {
  private matcher = new TolerationMatcher();
  
  filterNodes(nodes: Node[], tolerations: Toleration[]): Node[] {
    return nodes.filter(node => {
      const hardTaints = node.taints.filter(t => t.effect !== 'PreferNoSchedule');
      return this.matcher.toleratesAll(tolerations, hardTaints);
    });
  }
  
  scoreNodes(nodes: Node[], tolerations: Toleration[]): { node: Node; score: number }[] {
    return nodes.map(node => {
      const softTaints = node.taints.filter(t => t.effect === 'PreferNoSchedule');
      const untolerated = this.matcher.getUntoleratedTaints(tolerations, softTaints);
      return { node, score: 100 - untolerated.length * 10 };
    }).sort((a, b) => b.score - a.score);
  }
  
  shouldEvict(taints: Taint[], tolerations: Toleration[]): EvictionDecision {
    const noExecuteTaints = taints.filter(t => t.effect === 'NoExecute');
    const untolerated = this.matcher.getUntoleratedTaints(tolerations, noExecuteTaints);
    
    if (untolerated.length === 0) return { evict: false };
    
    const toleratedWithTimeout = tolerations.find(t => t.effect === 'NoExecute' && t.tolerationSeconds !== undefined);
    return { evict: true, after: toleratedWithTimeout?.tolerationSeconds };
  }
}

export interface EvictionDecision { evict: boolean; after?: number; }