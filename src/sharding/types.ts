export interface ShardConfig {
  shardId: string;
  host: string;
  port: number;
  database: string;
  weight: number;
  status: ShardStatus;
}

export type ShardStatus = 'active' | 'readonly' | 'offline' | 'migrating';

export interface ShardKey {
  field: string;
  type: 'hash' | 'range' | 'list';
}

export interface ShardMapping {
  shardId: string;
  keyRange?: { min: unknown; max: unknown };
  keyList?: unknown[];
}

export interface ShardStats {
  shardId: string;
  recordCount: number;
  sizeBytes: number;
  connections: number;
  latencyMs: number;
}