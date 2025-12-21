export interface MFAConfig {
  userId: string;
  enabled: boolean;
  method: MFAMethod;
  backupCodes?: string[];
  lastVerified?: string;
  enrolledAt?: string;
}

export type MFAMethod = 'totp' | 'sms' | 'email' | 'authenticator';

export interface MFAChallenge {
  id: string;
  method: MFAMethod;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
}

export interface MFAVerification {
  challengeId: string;
  code: string;
}

export interface TOTPSetup {
  secret: string;
  qrCode: string;
  manualEntry: string;
}

export interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: string;
}
