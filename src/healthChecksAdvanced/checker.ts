import { HealthCheck, HealthResult, HealthStatus } from './types';

export class HealthChecker {
  private checks: Map<string, HealthCheck> = new Map();
  
  register(check: HealthCheck): void { this.checks.set(check.name, check); }
  unregister(name: string): void { this.checks.delete(name); }
  
  async check(name: string): Promise<HealthResult> {
    const check = this.checks.get(name);
    if (!check) return { status: 'unhealthy', message: 'Check not found', duration: 0 };
    
    const start = Date.now();
    try {
      const result = await Promise.race([
        check.check(),
        new Promise<HealthResult>((_, reject) => setTimeout(() => reject(new Error('Timeout')), check.timeout))
      ]);
      return { ...result, duration: Date.now() - start };
    } catch (e) {
      return { status: 'unhealthy', message: (e as Error).message, duration: Date.now() - start };
    }
  }
  
  async checkAll(): Promise<Map<string, HealthResult>> {
    const results = new Map<string, HealthResult>();
    for (const [name] of this.checks) {
      results.set(name, await this.check(name));
    }
    return results;
  }
}