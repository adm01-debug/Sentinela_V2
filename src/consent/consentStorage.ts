import { UserConsent } from './consentManager';
export class ConsentStorage {
  private storageKey = 'user_consent';
  save(consent: UserConsent): void { localStorage.setItem(this.storageKey + '_' + consent.userId, JSON.stringify(consent)); }
  load(userId: string): UserConsent | null { const stored = localStorage.getItem(this.storageKey + '_' + userId); return stored ? JSON.parse(stored) : null; }
  remove(userId: string): void { localStorage.removeItem(this.storageKey + '_' + userId); }
  clear(): void { Object.keys(localStorage).filter(k => k.startsWith(this.storageKey)).forEach(k => localStorage.removeItem(k)); }
}
export const consentStorage = new ConsentStorage();
