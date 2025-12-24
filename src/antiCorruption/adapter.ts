import { ExternalServiceAdapter, HealthStatus } from './types';

export abstract class BaseServiceAdapter<T> implements ExternalServiceAdapter<T> {
  protected service: T;
  protected lastHealthCheck?: HealthStatus;
  
  constructor(service: T) { this.service = service; }
  
  getService(): T { return this.service; }
  
  async isAvailable(): Promise<boolean> {
    const status = await this.healthCheck();
    return status.healthy;
  }
  
  abstract healthCheck(): Promise<HealthStatus>;
}

export class RetryableAdapter<T> extends BaseServiceAdapter<T> {
  constructor(service: T, private maxRetries: number = 3, private delayMs: number = 1000) { super(service); }
  
  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      return { healthy: true, latencyMs: Date.now() - start, lastCheck: new Date() };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start, lastCheck: new Date() };
    }
  }
  
  async executeWithRetry<R>(operation: () => Promise<R>): Promise<R> {
    let lastError: Error | undefined;
    for (let i = 0; i < this.maxRetries; i++) {
      try { return await operation(); }
      catch (e) { lastError = e as Error; await this.delay(this.delayMs * Math.pow(2, i)); }
    }
    throw lastError;
  }
  
  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}