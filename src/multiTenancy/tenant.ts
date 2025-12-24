import { Tenant, TenantQuotas, TenantUsage } from './types';
import { v4 as uuidv4 } from 'uuid';

export class TenantManager {
  private tenants: Map<string, Tenant> = new Map();
  private usage: Map<string, TenantUsage> = new Map();
  
  create(name: string, quotas: TenantQuotas): Tenant {
    const tenant: Tenant = { id: uuidv4(), name, namespaces: [], quotas, status: 'active' };
    this.tenants.set(tenant.id, tenant);
    this.usage.set(tenant.id, { cpu: 0, memory: 0, storage: 0, namespaces: 0 });
    return tenant;
  }
  
  get(id: string): Tenant | undefined { return this.tenants.get(id); }
  getByName(name: string): Tenant | undefined { return Array.from(this.tenants.values()).find(t => t.name === name); }
  list(): Tenant[] { return Array.from(this.tenants.values()); }
  
  addNamespace(tenantId: string, namespace: string): boolean {
    const tenant = this.tenants.get(tenantId);
    const usage = this.usage.get(tenantId);
    if (!tenant || !usage) return false;
    if (usage.namespaces >= tenant.quotas.maxNamespaces) return false;
    tenant.namespaces.push(namespace);
    usage.namespaces++;
    return true;
  }
  
  suspend(tenantId: string): void { const t = this.tenants.get(tenantId); if (t) t.status = 'suspended'; }
  activate(tenantId: string): void { const t = this.tenants.get(tenantId); if (t) t.status = 'active'; }
  
  getUsage(tenantId: string): TenantUsage | undefined { return this.usage.get(tenantId); }
}