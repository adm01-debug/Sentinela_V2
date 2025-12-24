// Health Checker
import { ServiceInstance, ServiceRegistry } from "./registry";

export interface HealthCheck {
  check(instance: ServiceInstance): Promise<boolean>;
}

export class HttpHealthCheck implements HealthCheck {
  constructor(private path: string = "/health", private timeout: number = 5000) {}
  
  async check(instance: ServiceInstance): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const response = await fetch(\`http://\${instance.host}:\${instance.port}\${this.path}\`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class HealthChecker {
  private interval?: NodeJS.Timeout;

  constructor(
    private registry: ServiceRegistry,
    private healthCheck: HealthCheck,
    private checkInterval: number = 10000
  ) {}

  start(): void {
    this.interval = setInterval(() => this.checkAll(), this.checkInterval);
  }

  stop(): void {
    if (this.interval) clearInterval(this.interval);
  }

  private async checkAll(): Promise<void> {
    // Would iterate all services and check health
  }

  async checkInstance(instance: ServiceInstance): Promise<boolean> {
    const healthy = await this.healthCheck.check(instance);
    instance.status = healthy ? "healthy" : "unhealthy";
    return healthy;
  }
}
