import { Backend } from './balancer';
export class RoundRobinBalancer {
  private index = 0;
  select(backends: Backend[]): Backend | null { const healthy = backends.filter(b => b.healthy); if (healthy.length === 0) return null; this.index = (this.index + 1) % healthy.length; return healthy[this.index]; }
  reset(): void { this.index = 0; }
}
export const roundRobinBalancer = new RoundRobinBalancer();
