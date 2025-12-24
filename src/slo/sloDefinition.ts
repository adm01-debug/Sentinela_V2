export type SLOType = 'availability' | 'latency' | 'throughput' | 'error_rate';
export interface SLO { id: string; name: string; type: SLOType; target: number; window: '1d' | '7d' | '30d'; service: string; }
export class SLODefinition {
  private slos = new Map<string, SLO>();
  define(slo: Omit<SLO, 'id'>): SLO { const id = crypto.randomUUID(); const full: SLO = { id, ...slo }; this.slos.set(id, full); return full; }
  get(id: string): SLO | undefined { return this.slos.get(id); }
  getByService(service: string): SLO[] { return Array.from(this.slos.values()).filter(s => s.service === service); }
  list(): SLO[] { return Array.from(this.slos.values()); }
  delete(id: string): boolean { return this.slos.delete(id); }
}
export const sloDefinition = new SLODefinition();
