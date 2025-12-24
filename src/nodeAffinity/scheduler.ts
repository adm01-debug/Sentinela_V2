import { NodeAffinity, Node } from './types';
import { AffinityMatcher } from './matcher';

export class AffinityScheduler {
  private matcher = new AffinityMatcher();
  
  filterNodes(nodes: Node[], affinity?: NodeAffinity): Node[] {
    if (!affinity?.requiredDuringSchedulingIgnoredDuringExecution) return nodes;
    
    return nodes.filter(node => {
      const terms = affinity.requiredDuringSchedulingIgnoredDuringExecution!.nodeSelectorTerms;
      return terms.some(term => this.matcher.matchesTerm(node, term));
    });
  }
  
  scoreNodes(nodes: Node[], affinity?: NodeAffinity): ScoredNode[] {
    const preferred = affinity?.preferredDuringSchedulingIgnoredDuringExecution ?? [];
    return nodes.map(node => ({
      node,
      score: this.matcher.scoreNode(node, preferred)
    })).sort((a, b) => b.score - a.score);
  }
  
  selectNode(nodes: Node[], affinity?: NodeAffinity): Node | undefined {
    const filtered = this.filterNodes(nodes, affinity);
    if (filtered.length === 0) return undefined;
    
    const scored = this.scoreNodes(filtered, affinity);
    return scored[0]?.node;
  }
}

export interface ScoredNode { node: Node; score: number; }