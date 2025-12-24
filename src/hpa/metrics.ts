export class MetricsCollector {
  private podMetrics: Map<string, PodMetrics> = new Map();
  
  record(podName: string, namespace: string, cpu: number, memory: number): void {
    this.podMetrics.set(namespace + '/' + podName, { cpu, memory, timestamp: new Date() });
  }
  
  getAverageUtilization(namespace: string, selector: Record<string, string>): { cpu: number; memory: number } {
    const pods = Array.from(this.podMetrics.entries()).filter(([key]) => key.startsWith(namespace + '/'));
    if (pods.length === 0) return { cpu: 0, memory: 0 };
    
    const total = pods.reduce((acc, [, metrics]) => ({ cpu: acc.cpu + metrics.cpu, memory: acc.memory + metrics.memory }), { cpu: 0, memory: 0 });
    return { cpu: total.cpu / pods.length, memory: total.memory / pods.length };
  }
  
  getPodMetrics(namespace: string, podName: string): PodMetrics | undefined {
    return this.podMetrics.get(namespace + '/' + podName);
  }
}

export interface PodMetrics { cpu: number; memory: number; timestamp: Date; }