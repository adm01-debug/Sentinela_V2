export interface PrivacyPolicy { version: string; effectiveDate: Date; dataCollected: string[]; dataPurposes: string[]; dataSharing: string[]; retentionPeriod: string; }
export class PrivacyPolicyManager {
  private policy: PrivacyPolicy | null = null;
  set(policy: PrivacyPolicy): void { this.policy = policy; }
  get(): PrivacyPolicy | null { return this.policy; }
  getVersion(): string { return this.policy?.version || '0.0.0'; }
  isAccepted(acceptedVersion: string): boolean { return this.policy?.version === acceptedVersion; }
}
export const privacyPolicyManager = new PrivacyPolicyManager();
