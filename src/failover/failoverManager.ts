export type NodeStatus = 'healthy' | 'degraded' | 'unhealthy' | 'offline';
export interface Node { id: string; name: string; endpoint: string; status: NodeStatus; isPrimary: boolean; lastCheck: Date; }
export class FailoverManager {
  private nodes = new Map<string, Node>();
  private handlers: ((from: Node, to: Node) => void)[] = [];
  addNode(node: Node): void { this.nodes.set(node.id, node); }
  updateStatus(nodeId: string, status: NodeStatus): void { const node = this.nodes.get(nodeId); if (node) { node.status = status; node.lastCheck = new Date(); if (node.isPrimary && status === 'unhealthy') this.triggerFailover(node); } }
  private triggerFailover(failedNode: Node): void { const healthy = Array.from(this.nodes.values()).find(n => n.status === 'healthy' && !n.isPrimary); if (healthy) { failedNode.isPrimary = false; healthy.isPrimary = true; this.handlers.forEach(h => h(failedNode, healthy)); } }
  onFailover(handler: (from: Node, to: Node) => void): void { this.handlers.push(handler); }
  getPrimary(): Node | undefined { return Array.from(this.nodes.values()).find(n => n.isPrimary); }
}
export const failoverManager = new FailoverManager();
