import { Tenant } from './types';

export class TenantIsolation {
  private tenantNamespaces: Map<string, string> = new Map();
  
  registerNamespace(namespace: string, tenantId: string): void { this.tenantNamespaces.set(namespace, tenantId); }
  
  getTenantForNamespace(namespace: string): string | undefined { return this.tenantNamespaces.get(namespace); }
  
  canAccess(tenantId: string, namespace: string): boolean {
    const owner = this.tenantNamespaces.get(namespace);
    return owner === tenantId;
  }
  
  validateRequest(tenantId: string, targetNamespace: string): ValidationResult {
    const owner = this.tenantNamespaces.get(targetNamespace);
    if (!owner) return { valid: false, reason: 'Namespace not found' };
    if (owner !== tenantId) return { valid: false, reason: 'Access denied to namespace' };
    return { valid: true };
  }
  
  getNamespacesForTenant(tenantId: string): string[] {
    return Array.from(this.tenantNamespaces.entries()).filter(([, tid]) => tid === tenantId).map(([ns]) => ns);
  }
}

export interface ValidationResult { valid: boolean; reason?: string; }