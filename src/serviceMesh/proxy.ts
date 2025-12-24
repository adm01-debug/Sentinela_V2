// Service Mesh Proxy
export interface ProxyConfig {
  upstream: string;
  timeout: number;
  retries: number;
  circuitBreaker: { threshold: number; timeout: number };
}

export interface ProxyMetrics {
  requestCount: number;
  successCount: number;
  failureCount: number;
  latencyMs: number[];
}

export class ServiceProxy {
  private metrics: ProxyMetrics = { requestCount: 0, successCount: 0, failureCount: 0, latencyMs: [] };
  private circuitOpen = false;
  private failures = 0;

  constructor(private config: ProxyConfig) {}

  async forward(request: Request): Promise<Response> {
    if (this.circuitOpen) throw new Error("Circuit breaker open");
    
    this.metrics.requestCount++;
    const start = Date.now();
    
    try {
      const response = await this.executeWithRetry(request);
      this.metrics.successCount++;
      this.metrics.latencyMs.push(Date.now() - start);
      this.failures = 0;
      return response;
    } catch (error) {
      this.metrics.failureCount++;
      this.failures++;
      if (this.failures >= this.config.circuitBreaker.threshold) {
        this.circuitOpen = true;
        setTimeout(() => { this.circuitOpen = false; this.failures = 0; }, this.config.circuitBreaker.timeout);
      }
      throw error;
    }
  }

  private async executeWithRetry(request: Request): Promise<Response> {
    let lastError: Error | null = null;
    for (let i = 0; i <= this.config.retries; i++) {
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), this.config.timeout);
        return await fetch(this.config.upstream + new URL(request.url).pathname, {
          method: request.method, headers: request.headers, body: request.body, signal: controller.signal
        });
      } catch (e) { lastError = e as Error; }
    }
    throw lastError;
  }

  getMetrics(): ProxyMetrics { return { ...this.metrics }; }
}
