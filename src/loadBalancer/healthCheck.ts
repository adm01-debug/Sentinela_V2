import { Backend, loadBalancer } from './balancer';
export interface HealthCheckConfig { interval: number; timeout: number; path: string; expectedStatus: number; }
export class HealthChecker {
  private config: HealthCheckConfig = { interval: 10000, timeout: 5000, path: '/health', expectedStatus: 200 };
  private timer: NodeJS.Timeout | null = null;
  configure(config: Partial<HealthCheckConfig>): void { Object.assign(this.config, config); }
  async check(backend: Backend): Promise<boolean> { try { const controller = new AbortController(); setTimeout(() => controller.abort(), this.config.timeout); const res = await fetch(backend.url + this.config.path, { signal: controller.signal }); return res.status === this.config.expectedStatus; } catch { return false; } }
  start(): void { this.timer = setInterval(async () => { for (const backend of loadBalancer.getBackends()) { backend.healthy = await this.check(backend); } }, this.config.interval); }
  stop(): void { if (this.timer) clearInterval(this.timer); }
}
export const healthChecker = new HealthChecker();
