import { NodeGroup } from './types';

export class NodeGroupManager {
  private groups: Map<string, NodeGroup> = new Map();
  
  create(group: NodeGroup): void { this.groups.set(group.name, group); }
  delete(name: string): boolean { return this.groups.delete(name); }
  get(name: string): NodeGroup | undefined { return this.groups.get(name); }
  list(): NodeGroup[] { return Array.from(this.groups.values()); }
  
  findSuitableGroup(requirements: NodeRequirements): NodeGroup | undefined {
    return Array.from(this.groups.values()).find(ng => {
      if (ng.currentSize >= ng.maxSize) return false;
      if (requirements.labels) {
        for (const [key, value] of Object.entries(requirements.labels)) {
          if (ng.labels[key] !== value) return false;
        }
      }
      return true;
    });
  }
  
  getTotalCapacity(): { nodes: number; maxNodes: number } {
    let nodes = 0, maxNodes = 0;
    this.groups.forEach(ng => { nodes += ng.currentSize; maxNodes += ng.maxSize; });
    return { nodes, maxNodes };
  }
}

export interface NodeRequirements { labels?: Record<string, string>; taints?: string[]; }