export interface Backend { id: string; url: string; weight: number; healthy: boolean; connections: number; }
export class LoadBalancer {
  private backends: Backend[] = [];
  private algorithm: 'round_robin' | 'weighted' | 'least_conn' | 'ip_hash' = 'round_robin';
  private current = 0;
  addBackend(backend: Backend): void { this.backends.push(backend); }
  removeBackend(id: string): void { this.backends = this.backends.filter(b => b.id !== id); }
  setAlgorithm(algo: typeof this.algorithm): void { this.algorithm = algo; }
  getNext(clientIp?: string): Backend | null { const healthy = this.backends.filter(b => b.healthy); if (healthy.length === 0) return null; switch (this.algorithm) { case 'round_robin': this.current = (this.current + 1) % healthy.length; return healthy[this.current]; case 'least_conn': return healthy.sort((a, b) => a.connections - b.connections)[0]; case 'ip_hash': const hash = this.hashIp(clientIp || ''); return healthy[hash % healthy.length]; default: return healthy[0]; } }
  private hashIp(ip: string): number { return ip.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0); }
  getBackends(): Backend[] { return [...this.backends]; }
}
export const loadBalancer = new LoadBalancer();
