import { PSPManager } from './policy';
import { PSPValidator, PodSecurityContext, ValidationResult } from './validator';

export class PSPAdmissionController {
  private manager: PSPManager;
  private validator: PSPValidator;
  
  constructor() { this.manager = new PSPManager(); this.validator = new PSPValidator(); }
  
  registerPolicy(name: string, spec: any): void { this.manager.create({ name, spec }); }
  
  admit(podSpec: PodSecurityContext, serviceAccount: string): AdmissionResult {
    const policies = this.manager.list();
    
    for (const psp of policies) {
      const result = this.validator.validate(podSpec, psp);
      if (result.valid) return { allowed: true, policy: psp.name };
    }
    
    const allViolations = policies.flatMap(psp => this.validator.validate(podSpec, psp).violations);
    return { allowed: false, violations: [...new Set(allViolations)] };
  }
}

export interface AdmissionResult { allowed: boolean; policy?: string; violations?: string[]; }