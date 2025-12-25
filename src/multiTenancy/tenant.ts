/**
 * @fileoverview Multi-Tenancy
 * @module @sentinela/core/multiTenancy
 */
export interface Tenant { id: string; name: string; config: Record<string, unknown>; }
export class TenantManager {
  private tenants = new Map<string, Tenant>();
  create(tenant: Tenant): void { this.tenants.set(tenant.id, tenant); }
  get(id: string): Tenant | undefined { return this.tenants.get(id); }
  delete(id: string): void { this.tenants.delete(id); }
  list(): Tenant[] { return Array.from(this.tenants.values()); }
}
