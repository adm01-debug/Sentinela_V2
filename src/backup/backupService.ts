export interface BackupMetadata { id: string; name: string; size: number; createdAt: Date; type: 'full' | 'incremental'; }
export class BackupService {
  private backups: BackupMetadata[] = [];
  async create(name: string, data: any, type: 'full' | 'incremental' = 'full'): Promise<BackupMetadata> { const json = JSON.stringify(data); const metadata: BackupMetadata = { id: crypto.randomUUID(), name, size: json.length, createdAt: new Date(), type }; this.backups.push(metadata); localStorage.setItem('backup_' + metadata.id, json); return metadata; }
  list(): BackupMetadata[] { return [...this.backups]; }
  async restore(id: string): Promise<any> { const data = localStorage.getItem('backup_' + id); return data ? JSON.parse(data) : null; }
  delete(id: string): boolean { const idx = this.backups.findIndex(b => b.id === id); if (idx >= 0) { this.backups.splice(idx, 1); localStorage.removeItem('backup_' + id); return true; } return false; }
}
export const backupService = new BackupService();
