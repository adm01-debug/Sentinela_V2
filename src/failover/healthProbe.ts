import { failoverManager, NodeStatus } from './failoverManager';
export interface ProbeConfig { interval: number; timeout: number; threshold: number; }
export class HealthProbe {
  private config: ProbeConfig = { interval: 5000, timeout: 3000, threshold: 3 };
  private failures = new Map<string, number>();
  private timer: NodeJS.Timeout | null = null;
  configure(config: Partial<ProbeConfig>): void { Object.assign(this.config, config); }
  async probe(nodeId: string, endpoint: string): Promise<NodeStatus> { try { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), this.config.timeout); const response = await fetch(endpoint + '/health', { signal: controller.signal }); clearTimeout(timeout); if (response.ok) { this.failures.set(nodeId, 0); return 'healthy'; } return 'degraded'; } catch { const count = (this.failures.get(nodeId) || 0) + 1; this.failures.set(nodeId, count); return count >= this.config.threshold ? 'unhealthy' : 'degraded'; } }
  start(nodes: { id: string; endpoint: string }[]): void { this.timer = setInterval(async () => { for (const node of nodes) { const status = await this.probe(node.id, node.endpoint); failoverManager.updateStatus(node.id, status); } }, this.config.interval); }
  stop(): void { if (this.timer) clearInterval(this.timer); }
}
export const healthProbe = new HealthProbe();
