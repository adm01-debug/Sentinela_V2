import { rbac } from './rbac';
import { abac } from './abac';
export interface AccessRequest { userId: string; action: string; resource: string; resourceId: string; context?: Record<string, any>; }
export interface AccessDecision { allowed: boolean; reason: string; checkedAt: Date; }
export class PermissionResolver {
  resolve(request: AccessRequest): AccessDecision { const rbacResult = rbac.hasPermission(request.userId, request.action + ':' + request.resource); if (rbacResult) { return { allowed: true, reason: 'RBAC permission granted', checkedAt: new Date() }; } const abacResult = abac.evaluate({ userId: request.userId, ...request.context }, { type: request.resource, id: request.resourceId }, request.action); if (abacResult) { return { allowed: true, reason: 'ABAC policy matched', checkedAt: new Date() }; } return { allowed: false, reason: 'No matching permission or policy', checkedAt: new Date() }; }
}
export const permissionResolver = new PermissionResolver();
