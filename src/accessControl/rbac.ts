export interface Role { id: string; name: string; permissions: string[]; inherits?: string[]; }
export interface UserRole { userId: string; roleId: string; assignedAt: Date; expiresAt?: Date; }
export class RBAC {
  private roles = new Map<string, Role>();
  private userRoles = new Map<string, UserRole[]>();
  addRole(role: Role): void { this.roles.set(role.id, role); }
  assignRole(userId: string, roleId: string, expiresAt?: Date): void { if (!this.userRoles.has(userId)) this.userRoles.set(userId, []); this.userRoles.get(userId)!.push({ userId, roleId, assignedAt: new Date(), expiresAt }); }
  hasPermission(userId: string, permission: string): boolean { const roles = this.userRoles.get(userId) || []; for (const ur of roles) { if (ur.expiresAt && ur.expiresAt < new Date()) continue; const role = this.roles.get(ur.roleId); if (role?.permissions.includes(permission)) return true; if (role?.inherits) { for (const inheritedId of role.inherits) { const inherited = this.roles.get(inheritedId); if (inherited?.permissions.includes(permission)) return true; } } } return false; }
  getUserRoles(userId: string): Role[] { return (this.userRoles.get(userId) || []).map(ur => this.roles.get(ur.roleId)).filter(Boolean) as Role[]; }
}
export const rbac = new RBAC();
