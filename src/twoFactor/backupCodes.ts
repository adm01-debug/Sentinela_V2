export class BackupCodes {
  private usedCodes = new Set<string>();
  generate(count = 10): string[] { const codes: string[] = []; for (let i = 0; i < count; i++) { const code = Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(); codes.push(code.slice(0, 4) + '-' + code.slice(4)); } return codes; }
  validate(code: string, validCodes: string[]): boolean { if (this.usedCodes.has(code)) return false; if (!validCodes.includes(code)) return false; this.usedCodes.add(code); return true; }
  getRemainingCount(validCodes: string[]): number { return validCodes.filter(c => !this.usedCodes.has(c)).length; }
}
export const backupCodes = new BackupCodes();
