import { haCluster, ClusterNode } from './haCluster';
export interface HeartbeatConfig { interval: number; timeout: number; retries: number; }
export class Heartbeat {
  private config: HeartbeatConfig = { interval: 1000, timeout: 3000, retries: 3 };
  private timer: NodeJS.Timeout | null = null;
  private failures = new Map<string, number>();
  configure(config: Partial<HeartbeatConfig>): void { Object.assign(this.config, config); }
  async send(node: ClusterNode): Promise<boolean> { try { const res = await fetch(node.endpoint + '/heartbeat', { method: 'POST' }); if (res.ok) { node.lastHeartbeat = new Date(); node.healthy = true; this.failures.set(node.id, 0); return true; } } catch {} const count = (this.failures.get(node.id) || 0) + 1; this.failures.set(node.id, count); if (count >= this.config.retries) node.healthy = false; return false; }
  start(): void { this.timer = setInterval(() => { haCluster.getNodes().forEach(n => this.send(n)); }, this.config.interval); }
  stop(): void { if (this.timer) clearInterval(this.timer); }
}
export const heartbeat = new Heartbeat();
