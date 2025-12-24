import { BackupMetadata } from './backupService';
export class BackupValidator {
  validateMetadata(metadata: BackupMetadata): boolean { return !!metadata.id && !!metadata.name && metadata.size > 0 && !!metadata.createdAt; }
  validateData(data: string): boolean { try { JSON.parse(data); return true; } catch { return false; } }
  async validateIntegrity(id: string, expectedChecksum: string): Promise<boolean> { const data = localStorage.getItem('backup_' + id); if (!data) return false; const checksum = await this.calculateChecksum(data); return checksum === expectedChecksum; }
  async calculateChecksum(data: string): Promise<string> { const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)); return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''); }
}
export const backupValidator = new BackupValidator();
