export interface ReplicationConfig { primary: string; replicas: string[]; mode: 'sync' | 'async'; }
