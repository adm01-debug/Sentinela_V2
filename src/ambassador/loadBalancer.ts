// Ambassador Load Balancer
export interface Backend {
  id: string;
  url: string;
  weight: number;
  healthy: boolean;
}

export type LBStrategy = "round-robin" | "weighted" | "least-connections" | "random";

export class AmbassadorLoadBalancer {
  private backends: Backend[] = [];
  private connections: Map<string, number> = new Map();
  private rrIndex = 0;

  constructor(private strategy: LBStrategy = "round-robin") {}

  addBackend(backend: Backend): void {
    this.backends.push(backend);
    this.connections.set(backend.id, 0);
  }

  removeBackend(id: string): void {
    this.backends = this.backends.filter(b => b.id !== id);
    this.connections.delete(id);
  }

  selectBackend(): Backend | null {
    const healthy = this.backends.filter(b => b.healthy);
    if (healthy.length === 0) return null;

    switch (this.strategy) {
      case "round-robin":
        this.rrIndex = (this.rrIndex + 1) % healthy.length;
        return healthy[this.rrIndex];
      case "random":
        return healthy[Math.floor(Math.random() * healthy.length)];
      case "least-connections":
        return healthy.reduce((a, b) => 
          (this.connections.get(a.id) || 0) < (this.connections.get(b.id) || 0) ? a : b
        );
      case "weighted":
        const total = healthy.reduce((sum, b) => sum + b.weight, 0);
        let random = Math.random() * total;
        for (const backend of healthy) {
          random -= backend.weight;
          if (random <= 0) return backend;
        }
        return healthy[0];
      default:
        return healthy[0];
    }
  }

  markConnectionStart(id: string): void {
    this.connections.set(id, (this.connections.get(id) || 0) + 1);
  }

  markConnectionEnd(id: string): void {
    this.connections.set(id, Math.max(0, (this.connections.get(id) || 0) - 1));
  }

  setHealthy(id: string, healthy: boolean): void {
    const backend = this.backends.find(b => b.id === id);
    if (backend) backend.healthy = healthy;
  }
}
