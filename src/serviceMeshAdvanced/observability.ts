export class MeshTelemetry {
  private metrics: Map<string, ServiceMetrics> = new Map();
  
  recordRequest(source: string, destination: string, latency: number, success: boolean): void {
    const key = source + '->' + destination;
    const metrics = this.metrics.get(key) ?? { requests: 0, errors: 0, totalLatency: 0 };
    metrics.requests++;
    if (!success) metrics.errors++;
    metrics.totalLatency += latency;
    this.metrics.set(key, metrics);
  }
  
  getMetrics(source: string, destination: string): ServiceMetrics | undefined {
    return this.metrics.get(source + '->' + destination);
  }
  
  getServiceGraph(): ServiceEdge[] {
    return Array.from(this.metrics.entries()).map(([key, metrics]) => {
      const [source, destination] = key.split('->');
      return { source, destination, requests: metrics.requests, errorRate: metrics.errors / metrics.requests, avgLatency: metrics.totalLatency / metrics.requests };
    });
  }
}

export interface ServiceMetrics { requests: number; errors: number; totalLatency: number; }
export interface ServiceEdge { source: string; destination: string; requests: number; errorRate: number; avgLatency: number; }