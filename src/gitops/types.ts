export interface GitOpsConfig { repo: string; branch: string; path: string; syncInterval: number; }
export interface Manifest { kind: string; metadata: { name: string; namespace?: string }; spec: Record<string, unknown>; }
export interface SyncStatus { lastSync: Date; status: 'synced' | 'pending' | 'failed'; message?: string; }