export interface SecurityPolicy { passwordMinLength: number; passwordRequireUppercase: boolean; passwordRequireNumbers: boolean; passwordRequireSpecial: boolean; sessionTimeout: number; maxLoginAttempts: number; lockoutDuration: number; }
export const defaultSecurityPolicy: SecurityPolicy = { passwordMinLength: 12, passwordRequireUppercase: true, passwordRequireNumbers: true, passwordRequireSpecial: true, sessionTimeout: 3600000, maxLoginAttempts: 5, lockoutDuration: 900000 };
export class SecurityPolicyManager {
  private policy: SecurityPolicy = { ...defaultSecurityPolicy };
  get(): SecurityPolicy { return { ...this.policy }; }
  set(policy: Partial<SecurityPolicy>): void { this.policy = { ...this.policy, ...policy }; }
  validatePassword(password: string): boolean { if (password.length < this.policy.passwordMinLength) return false; if (this.policy.passwordRequireUppercase && !/[A-Z]/.test(password)) return false; if (this.policy.passwordRequireNumbers && !/[0-9]/.test(password)) return false; if (this.policy.passwordRequireSpecial && !/[!@#$%^&*]/.test(password)) return false; return true; }
}
export const securityPolicyManager = new SecurityPolicyManager();
