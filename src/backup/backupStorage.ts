export interface BackupStorageConfig { type: 'local' | 'indexedDB' | 'remote'; maxBackups?: number; }
export class BackupStorage {
  private config: BackupStorageConfig = { type: 'local', maxBackups: 10 };
  configure(config: BackupStorageConfig): void { this.config = config; }
  async save(id: string, data: string): Promise<void> { localStorage.setItem('backup_data_' + id, data); }
  async load(id: string): Promise<string | null> { return localStorage.getItem('backup_data_' + id); }
  async delete(id: string): Promise<void> { localStorage.removeItem('backup_data_' + id); }
  async getSize(): Promise<number> { let size = 0; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key?.startsWith('backup_')) size += localStorage.getItem(key)?.length || 0; } return size; }
}
export const backupStorage = new BackupStorage();
