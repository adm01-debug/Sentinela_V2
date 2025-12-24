import { Role, ClusterRole, PolicyRule } from './types';

export class RoleManager {
  private roles: Map<string, Role> = new Map();
  private clusterRoles: Map<string, ClusterRole> = new Map();
  
  createRole(role: Role): void { this.roles.set(role.namespace + '/' + role.name, role); }
  createClusterRole(role: ClusterRole): void { this.clusterRoles.set(role.name, role); }
  
  getRole(namespace: string, name: string): Role | undefined { return this.roles.get(namespace + '/' + name); }
  getClusterRole(name: string): ClusterRole | undefined { return this.clusterRoles.get(name); }
  
  deleteRole(namespace: string, name: string): boolean { return this.roles.delete(namespace + '/' + name); }
  deleteClusterRole(name: string): boolean { return this.clusterRoles.delete(name); }
  
  listRoles(namespace?: string): Role[] {
    const all = Array.from(this.roles.values());
    return namespace ? all.filter(r => r.namespace === namespace) : all;
  }
  listClusterRoles(): ClusterRole[] { return Array.from(this.clusterRoles.values()); }
}