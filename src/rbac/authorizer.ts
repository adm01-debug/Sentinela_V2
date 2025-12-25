/**
 * @fileoverview RBAC implementation
 * @module @sentinela/core/rbac
 * @version 13.0.0
 */

export interface Role {
  name: string;
  permissions: string[];
  inherits?: string[];
}

export class RoleManager {
  private roles = new Map<string, Role>();
  private userRoles = new Map<string, Set<string>>();

  async createRole(name: string, permissions: string[], inherits?: string[]): Promise<void> {
    this.roles.set(name, { name, permissions, inherits });
  }

  async deleteRole(name: string): Promise<void> {
    this.roles.delete(name);
  }

  async getRole(name: string): Promise<Role | undefined> {
    return this.roles.get(name);
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    if (!this.roles.has(roleName)) throw new Error('Role not found');
    const userRoleSet = this.userRoles.get(userId) ?? new Set();
    userRoleSet.add(roleName);
    this.userRoles.set(userId, userRoleSet);
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    this.userRoles.get(userId)?.delete(roleName);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    return Array.from(this.userRoles.get(userId) ?? []);
  }

  async getPermissions(userId: string): Promise<Set<string>> {
    const permissions = new Set<string>();
    const roleNames = await this.getUserRoles(userId);
    
    const processRole = (name: string): void => {
      const role = this.roles.get(name);
      if (!role) return;
      role.permissions.forEach(p => permissions.add(p));
      role.inherits?.forEach(processRole);
    };

    roleNames.forEach(processRole);
    return permissions;
  }
}

export class Authorizer {
  constructor(private roleManager: RoleManager) {}

  async can(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.roleManager.getPermissions(userId);
    return permissions.has(permission) || permissions.has('*');
  }

  async canAll(userId: string, permissions: string[]): Promise<boolean> {
    const userPerms = await this.roleManager.getPermissions(userId);
    return permissions.every(p => userPerms.has(p) || userPerms.has('*'));
  }

  async canAny(userId: string, permissions: string[]): Promise<boolean> {
    const userPerms = await this.roleManager.getPermissions(userId);
    return permissions.some(p => userPerms.has(p) || userPerms.has('*'));
  }
}
