export class MeshTelemetry {
  private metrics: Map<string, number[]> = new Map();
  
  recordLatency(service: string, latencyMs: number): void {
    const values = this.metrics.get(service) ?? [];
    values.push(latencyMs);
    if (values.length > 1000) values.shift();
    this.metrics.set(service, values);
  }
  
  recordError(service: string): void { this.recordLatency(service + '_errors', 1); }
  
  getStats(service: string): ServiceStats {
    const latencies = this.metrics.get(service) ?? [];
    const errors = this.metrics.get(service + '_errors')?.length ?? 0;
    return {
      avgLatency: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      p99Latency: latencies.length ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.99)] : 0,
      requestCount: latencies.length,
      errorCount: errors,
      errorRate: latencies.length ? errors / latencies.length : 0
    };
  }
}

export interface ServiceStats {
  avgLatency: number;
  p99Latency: number;
  requestCount: number;
  errorCount: number;
  errorRate: number;
}