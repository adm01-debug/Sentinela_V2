import { securityPolicyManager } from './securityPolicy';
import { privacyPolicyManager } from './privacyPolicy';
import { cookiePolicyManager } from './cookiePolicy';
export class PolicyManager {
  get security() { return securityPolicyManager; }
  get privacy() { return privacyPolicyManager; }
  get cookies() { return cookiePolicyManager; }
  exportAll(): object { return { security: securityPolicyManager.get(), privacy: privacyPolicyManager.get(), cookies: cookiePolicyManager.get() }; }
}
export const policyManager = new PolicyManager();
