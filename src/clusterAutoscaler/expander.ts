import { NodeGroup } from './types';

export type ExpanderStrategy = 'random' | 'most-pods' | 'least-waste' | 'price' | 'priority';

export class NodeGroupExpander {
  constructor(private strategy: ExpanderStrategy = 'random') {}
  
  select(candidates: NodeGroup[], pendingPods: number): NodeGroup | undefined {
    if (candidates.length === 0) return undefined;
    
    switch (this.strategy) {
      case 'random': return candidates[Math.floor(Math.random() * candidates.length)];
      case 'most-pods': return this.selectMostPods(candidates);
      case 'least-waste': return this.selectLeastWaste(candidates, pendingPods);
      case 'priority': return this.selectByPriority(candidates);
      default: return candidates[0];
    }
  }
  
  private selectMostPods(candidates: NodeGroup[]): NodeGroup {
    return candidates.reduce((best, ng) => (ng.maxSize - ng.currentSize) > (best.maxSize - best.currentSize) ? ng : best);
  }
  
  private selectLeastWaste(candidates: NodeGroup[], pendingPods: number): NodeGroup {
    return candidates[0];
  }
  
  private selectByPriority(candidates: NodeGroup[]): NodeGroup {
    return candidates[0];
  }
}