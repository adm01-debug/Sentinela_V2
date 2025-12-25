/**
 * @fileoverview Health Check Utilities
 * @module @sentinela/core/health-check
 */
export interface HealthStatus { status: 'healthy' | 'unhealthy' | 'degraded'; message?: string; latency?: number; }
export interface HealthCheckConfig { timeout?: number; interval?: number; }
export class HealthCheck {
  constructor(private name: string, private check: () => Promise<HealthStatus>, private config: HealthCheckConfig = {}) {}
  async run(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const result = await Promise.race([
        this.check(),
        new Promise<HealthStatus>((_, reject) => setTimeout(() => reject(new Error('Timeout')), this.config.timeout ?? 5000))
      ]);
      return { ...result, latency: Date.now() - start };
    } catch (e) { return { status: 'unhealthy', message: String(e), latency: Date.now() - start }; }
  }
}
