import { Subject, PolicyRule } from './types';
import { RoleManager } from './roles';
import { BindingManager } from './bindings';

export class RBACAuthorizer {
  constructor(private roleManager: RoleManager, private bindingManager: BindingManager) {}
  
  authorize(subject: Subject, verb: string, resource: string, namespace?: string): AuthorizationResult {
    const rules = this.getRulesForSubject(subject, namespace);
    
    for (const rule of rules) {
      if (this.ruleMatches(rule, verb, resource)) {
        return { allowed: true, reason: 'RBAC: allowed by rule' };
      }
    }
    
    return { allowed: false, reason: 'RBAC: no matching rule' };
  }
  
  private getRulesForSubject(subject: Subject, namespace?: string): PolicyRule[] {
    const rules: PolicyRule[] = [];
    
    const roleBindings = this.bindingManager.getRoleBindingsForSubject(subject, namespace);
    for (const rb of roleBindings) {
      if (rb.roleRef.kind === 'Role') {
        const role = this.roleManager.getRole(rb.namespace, rb.roleRef.name);
        if (role) rules.push(...role.rules);
      } else {
        const clusterRole = this.roleManager.getClusterRole(rb.roleRef.name);
        if (clusterRole) rules.push(...clusterRole.rules);
      }
    }
    
    const clusterRoleBindings = this.bindingManager.getClusterRoleBindingsForSubject(subject);
    for (const crb of clusterRoleBindings) {
      const clusterRole = this.roleManager.getClusterRole(crb.roleRef.name);
      if (clusterRole) rules.push(...clusterRole.rules);
    }
    
    return rules;
  }
  
  private ruleMatches(rule: PolicyRule, verb: string, resource: string): boolean {
    const verbMatch = rule.verbs.includes(verb) || rule.verbs.includes('*');
    const resourceMatch = rule.resources.includes(resource) || rule.resources.includes('*');
    return verbMatch && resourceMatch;
  }
}

export interface AuthorizationResult { allowed: boolean; reason: string; }