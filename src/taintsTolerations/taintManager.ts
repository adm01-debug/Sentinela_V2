import { Taint, TaintEffect, Node } from './types';

export class TaintManager {
  private nodes: Map<string, Node> = new Map();
  
  addTaint(nodeName: string, taint: Taint): void {
    const node = this.nodes.get(nodeName) ?? { name: nodeName, taints: [] };
    const existing = node.taints.findIndex(t => t.key === taint.key && t.effect === taint.effect);
    if (existing >= 0) node.taints[existing] = taint;
    else node.taints.push(taint);
    this.nodes.set(nodeName, node);
  }
  
  removeTaint(nodeName: string, key: string, effect?: TaintEffect): void {
    const node = this.nodes.get(nodeName);
    if (node) {
      node.taints = node.taints.filter(t => !(t.key === key && (!effect || t.effect === effect)));
    }
  }
  
  getTaints(nodeName: string): Taint[] { return this.nodes.get(nodeName)?.taints ?? []; }
  getNode(nodeName: string): Node | undefined { return this.nodes.get(nodeName); }
  
  getNodesWithTaint(key: string): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.taints.some(t => t.key === key));
  }
}