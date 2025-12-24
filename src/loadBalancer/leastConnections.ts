import { Backend } from './balancer';
export class LeastConnectionsBalancer {
  select(backends: Backend[]): Backend | null { const healthy = backends.filter(b => b.healthy); if (healthy.length === 0) return null; return healthy.reduce((min, b) => b.connections < min.connections ? b : min, healthy[0]); }
  incrementConnection(backend: Backend): void { backend.connections++; }
  decrementConnection(backend: Backend): void { backend.connections = Math.max(0, backend.connections - 1); }
}
export const leastConnectionsBalancer = new LeastConnectionsBalancer();
