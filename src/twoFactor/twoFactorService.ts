import { totpGenerator } from './totpGenerator';
import { backupCodes } from './backupCodes';
export class TwoFactorService {
  generateSecret(): string { const bytes = crypto.getRandomValues(new Uint8Array(20)); const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; return Array.from(bytes).map(b => alphabet[b % 32]).join(''); }
  async verifyTOTP(secret: string, code: string): Promise<boolean> { const expected = await totpGenerator.generate(secret); return code === expected; }
  generateBackupCodes(): string[] { return backupCodes.generate(); }
  verifyBackupCode(code: string, validCodes: string[]): boolean { return backupCodes.validate(code, validCodes); }
}
export const twoFactorService = new TwoFactorService();
