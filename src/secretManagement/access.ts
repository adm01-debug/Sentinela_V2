import { AccessPolicy, Permission } from './types';

export class AccessManager {
  private policies: Map<string, AccessPolicy> = new Map();
  
  grantAccess(secretId: string, principal: string, permissions: Permission[]): void {
    const policy = this.policies.get(secretId) ?? { secretId, principals: [], permissions: [] };
    if (!policy.principals.includes(principal)) policy.principals.push(principal);
    permissions.forEach(p => { if (!policy.permissions.includes(p)) policy.permissions.push(p); });
    this.policies.set(secretId, policy);
  }
  
  revokeAccess(secretId: string, principal: string): void {
    const policy = this.policies.get(secretId);
    if (policy) policy.principals = policy.principals.filter(p => p !== principal);
  }
  
  checkAccess(secretId: string, principal: string, permission: Permission): boolean {
    const policy = this.policies.get(secretId);
    if (!policy) return false;
    return policy.principals.includes(principal) && policy.permissions.includes(permission);
  }
  
  getPolicy(secretId: string): AccessPolicy | undefined { return this.policies.get(secretId); }
  
  audit(secretId: string): AuditLog[] { return []; }
}

export interface AuditLog { timestamp: Date; principal: string; action: string; secretId: string; success: boolean; }