/**
 * @fileoverview Health Checker
 * @module @sentinela/core/healthChecksAdvanced
 * @version 13.0.0
 */
export interface HealthResult { name: string; status: 'healthy' | 'unhealthy'; latency?: number; error?: string; }
export type HealthCheck = () => Promise<HealthResult>;
export class HealthChecker {
  private checks = new Map<string, HealthCheck>();
  register(name: string, check: HealthCheck): void { this.checks.set(name, check); }
  async runAll(): Promise<HealthResult[]> {
    const results: HealthResult[] = [];
    for (const [name, check] of this.checks) {
      try { results.push(await check()); } 
      catch (e) { results.push({ name, status: 'unhealthy', error: String(e) }); }
    }
    return results;
  }
}
