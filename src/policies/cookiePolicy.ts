export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';
export interface CookiePolicy { essential: boolean; functional: boolean; analytics: boolean; marketing: boolean; }
export const defaultCookiePolicy: CookiePolicy = { essential: true, functional: false, analytics: false, marketing: false };
export class CookiePolicyManager {
  private policy: CookiePolicy = { ...defaultCookiePolicy };
  get(): CookiePolicy { return { ...this.policy }; }
  set(policy: Partial<CookiePolicy>): void { this.policy = { ...this.policy, ...policy, essential: true }; }
  isAllowed(category: CookieCategory): boolean { return this.policy[category]; }
  acceptAll(): void { this.policy = { essential: true, functional: true, analytics: true, marketing: true }; }
  rejectAll(): void { this.policy = { ...defaultCookiePolicy }; }
}
export const cookiePolicyManager = new CookiePolicyManager();
