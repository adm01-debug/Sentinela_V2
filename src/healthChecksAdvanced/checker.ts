/**
 * @fileoverview Health Checker
 * @module @sentinela/core/healthChecksAdvanced
 */
export interface HealthCheck { name: string; check: () => Promise<{ status: string; latency?: number }>; }
export class HealthChecker {
  private checks: HealthCheck[] = [];
  register(check: HealthCheck): void { this.checks.push(check); }
  async runAll(): Promise<Record<string, { status: string; latency?: number }>> {
    const results: Record<string, any> = {};
    for (const c of this.checks) results[c.name] = await c.check();
    return results;
  }
}
