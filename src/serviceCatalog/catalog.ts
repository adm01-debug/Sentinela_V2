/**
 * @fileoverview Service Catalog
 * @module @sentinela/core/serviceCatalog
 */
export interface ServiceEntry { name: string; version: string; description: string; endpoints: string[]; }
export class ServiceCatalog {
  private services = new Map<string, ServiceEntry>();
  register(svc: ServiceEntry): void { this.services.set(svc.name, svc); }
  get(name: string): ServiceEntry | undefined { return this.services.get(name); }
  list(): ServiceEntry[] { return Array.from(this.services.values()); }
  search(query: string): ServiceEntry[] { return this.list().filter(s => s.name.includes(query) || s.description.includes(query)); }
}
