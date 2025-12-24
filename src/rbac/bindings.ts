import { RoleBinding, ClusterRoleBinding, Subject } from './types';

export class BindingManager {
  private roleBindings: Map<string, RoleBinding> = new Map();
  private clusterRoleBindings: Map<string, ClusterRoleBinding> = new Map();
  
  createRoleBinding(binding: RoleBinding): void { this.roleBindings.set(binding.namespace + '/' + binding.name, binding); }
  createClusterRoleBinding(binding: ClusterRoleBinding): void { this.clusterRoleBindings.set(binding.name, binding); }
  
  getRoleBindingsForSubject(subject: Subject, namespace?: string): RoleBinding[] {
    return Array.from(this.roleBindings.values()).filter(rb => {
      if (namespace && rb.namespace !== namespace) return false;
      return rb.subjects.some(s => s.kind === subject.kind && s.name === subject.name);
    });
  }
  
  getClusterRoleBindingsForSubject(subject: Subject): ClusterRoleBinding[] {
    return Array.from(this.clusterRoleBindings.values()).filter(crb => crb.subjects.some(s => s.kind === subject.kind && s.name === subject.name));
  }
  
  listRoleBindings(namespace?: string): RoleBinding[] {
    const all = Array.from(this.roleBindings.values());
    return namespace ? all.filter(rb => rb.namespace === namespace) : all;
  }
}