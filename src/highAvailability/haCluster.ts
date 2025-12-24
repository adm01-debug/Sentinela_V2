export type ClusterRole = 'primary' | 'secondary' | 'arbiter';
export interface ClusterNode { id: string; role: ClusterRole; endpoint: string; healthy: boolean; lastHeartbeat: Date; }
export class HACluster {
  private nodes = new Map<string, ClusterNode>();
  private electionInProgress = false;
  addNode(node: ClusterNode): void { this.nodes.set(node.id, node); }
  removeNode(id: string): void { this.nodes.delete(id); }
  getPrimary(): ClusterNode | undefined { return Array.from(this.nodes.values()).find(n => n.role === 'primary' && n.healthy); }
  electPrimary(): ClusterNode | null { if (this.electionInProgress) return null; this.electionInProgress = true; const candidates = Array.from(this.nodes.values()).filter(n => n.healthy && n.role !== 'arbiter'); if (candidates.length === 0) { this.electionInProgress = false; return null; } const newPrimary = candidates[0]; this.nodes.forEach(n => n.role = n.id === newPrimary.id ? 'primary' : 'secondary'); this.electionInProgress = false; return newPrimary; }
  getNodes(): ClusterNode[] { return Array.from(this.nodes.values()); }
}
export const haCluster = new HACluster();
