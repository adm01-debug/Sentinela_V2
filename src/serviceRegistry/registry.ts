// Service Registry Core
export interface ServiceInfo { name: string; version: string; endpoints: string[]; metadata: Record<string, string>; health: "up" | "down" | "unknown"; }
export class ServiceRegistry {
  private services: Map<string, ServiceInfo[]> = new Map();
  register(service: ServiceInfo): void { if (!this.services.has(service.name)) this.services.set(service.name, []); this.services.get(service.name)!.push(service); }
  deregister(name: string, version?: string): void { if (version) { const services = this.services.get(name); if (services) this.services.set(name, services.filter(s => s.version !== version)); } else { this.services.delete(name); } }
  lookup(name: string): ServiceInfo[] { return this.services.get(name)?.filter(s => s.health === "up") || []; }
  all(): ServiceInfo[] { return Array.from(this.services.values()).flat(); }
}
