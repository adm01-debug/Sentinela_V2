export type ConsentPurpose = 'marketing' | 'analytics' | 'personalization' | 'thirdParty';
export interface UserConsent { userId: string; purposes: Record<ConsentPurpose, boolean>; givenAt: Date; version: string; }
export class ConsentManager {
  private consents = new Map<string, UserConsent>();
  give(userId: string, purposes: Record<ConsentPurpose, boolean>, version: string): UserConsent { const consent: UserConsent = { userId, purposes, givenAt: new Date(), version }; this.consents.set(userId, consent); return consent; }
  get(userId: string): UserConsent | undefined { return this.consents.get(userId); }
  hasConsent(userId: string, purpose: ConsentPurpose): boolean { return this.consents.get(userId)?.purposes[purpose] || false; }
  revoke(userId: string): void { this.consents.delete(userId); }
  updatePurpose(userId: string, purpose: ConsentPurpose, value: boolean): void { const consent = this.consents.get(userId); if (consent) consent.purposes[purpose] = value; }
}
export const consentManager = new ConsentManager();
