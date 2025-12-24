import { ServiceHealth } from './types';
import { ServiceRegistry, RegisteredService } from './registry';

export class HealthChecker {
  constructor(private registry: ServiceRegistry) {}
  
  async checkAll(): Promise<Map<string, ServiceHealth>> {
    const results = new Map<string, ServiceHealth>();
    for (const service of this.registry.getAll()) {
      const health = await this.check(service);
      this.registry.updateHealth(service.id, health);
      results.set(service.id, health);
    }
    return results;
  }
  
  async check(service: RegisteredService): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const endpoint = service.definition.endpoints[0];
      const url = endpoint.protocol + '://' + endpoint.host + ':' + endpoint.port + '/health';
      await fetch(url, { signal: AbortSignal.timeout(5000) });
      return { status: 'healthy', lastCheck: new Date(), latency: Date.now() - start };
    } catch {
      return { status: 'unhealthy', lastCheck: new Date(), latency: Date.now() - start };
    }
  }
  
  startPeriodicCheck(intervalMs: number = 30000): NodeJS.Timeout {
    return setInterval(() => this.checkAll(), intervalMs);
  }
}