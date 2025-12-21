export interface Backup {
  id: string;
  createdAt: string;
  size: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'full' | 'incremental';
  url?: string;
}

export interface RestoreOptions {
  backupId: string;
  targetDate?: string;
  tables?: string[];
}

export interface BackupSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retention: number;
}