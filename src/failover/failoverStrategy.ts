import { Node } from './failoverManager';
export type FailoverStrategy = 'priority' | 'round_robin' | 'least_connections' | 'random';
export class FailoverStrategyManager {
  private strategy: FailoverStrategy = 'priority';
  private priorities = new Map<string, number>();
  private connections = new Map<string, number>();
  setStrategy(strategy: FailoverStrategy): void { this.strategy = strategy; }
  setPriority(nodeId: string, priority: number): void { this.priorities.set(nodeId, priority); }
  selectNode(nodes: Node[]): Node | null { const healthy = nodes.filter(n => n.status === 'healthy'); if (healthy.length === 0) return null; switch (this.strategy) { case 'priority': return healthy.sort((a, b) => (this.priorities.get(a.id) || 0) - (this.priorities.get(b.id) || 0))[0]; case 'round_robin': return healthy[0]; case 'least_connections': return healthy.sort((a, b) => (this.connections.get(a.id) || 0) - (this.connections.get(b.id) || 0))[0]; case 'random': return healthy[Math.floor(Math.random() * healthy.length)]; default: return healthy[0]; } }
}
export const failoverStrategyManager = new FailoverStrategyManager();
