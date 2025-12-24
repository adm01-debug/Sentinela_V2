import { Node } from './types';

export class TopologySpreadConstraint {
  constructor(private topologyKey: string, private maxSkew: number) {}
  
  calculateSkew(nodes: Node[], podCounts: Map<string, number>): Map<string, number> {
    const byTopology = new Map<string, number>();
    
    nodes.forEach(node => {
      const topology = node.labels[this.topologyKey];
      if (topology) {
        const count = podCounts.get(node.name) ?? 0;
        byTopology.set(topology, (byTopology.get(topology) ?? 0) + count);
      }
    });
    
    return byTopology;
  }
  
  isWithinSkew(nodes: Node[], podCounts: Map<string, number>, targetTopology: string): boolean {
    const distribution = this.calculateSkew(nodes, podCounts);
    const targetCount = (distribution.get(targetTopology) ?? 0) + 1;
    const minCount = Math.min(...distribution.values(), 0);
    return targetCount - minCount <= this.maxSkew;
  }
  
  selectBestTopology(nodes: Node[], podCounts: Map<string, number>): string | undefined {
    const distribution = this.calculateSkew(nodes, podCounts);
    let minTopology: string | undefined;
    let minCount = Infinity;
    
    distribution.forEach((count, topology) => {
      if (count < minCount) { minCount = count; minTopology = topology; }
    });
    
    return minTopology;
  }
}