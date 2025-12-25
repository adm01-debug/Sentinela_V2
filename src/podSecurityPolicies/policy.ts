/**
 * @fileoverview Pod security policy manager
 * @module @sentinela/core/podSecurityPolicies
 * @version 13.0.0
 */

import { PodSecurityPolicy, PSPSpec } from './types';

export class PSPManager {
  private policies: Map<string, PodSecurityPolicy> = new Map();
  
  create(psp: PodSecurityPolicy): void { this.policies.set(psp.name, psp); }
  delete(name: string): boolean { return this.policies.delete(name); }
  get(name: string): PodSecurityPolicy | undefined { return this.policies.get(name); }
  list(): PodSecurityPolicy[] { return Array.from(this.policies.values()); }
  
  static restrictedPolicy(): PodSecurityPolicy {
    return {
      name: 'restricted',
      spec: { privileged: false, hostNetwork: false, hostPID: false, hostIPC: false, runAsUser: { rule: 'MustRunAsNonRoot' }, fsGroup: { rule: 'RunAsAny' }, volumes: ['configMap', 'emptyDir', 'projected', 'secret', 'downwardAPI', 'persistentVolumeClaim'], requiredDropCapabilities: ['ALL'] }
    };
  }
  
  static privilegedPolicy(): PodSecurityPolicy {
    return {
      name: 'privileged',
      spec: { privileged: true, hostNetwork: true, hostPID: true, hostIPC: true, runAsUser: { rule: 'RunAsAny' }, fsGroup: { rule: 'RunAsAny' }, volumes: ['*'], allowedCapabilities: ['*'] }
    };
  }
}