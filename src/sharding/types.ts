export interface ShardConfig { shardId: string; minKey: string; maxKey: string; host: string; port: number; status: ShardStatus; }
export type ShardStatus = 'active' | 'draining' | 'offline' | 'readonly';
export interface ShardKey { value: string; hash: number; }
export interface ShardingStrategy { getShard(key: ShardKey, shards: ShardConfig[]): ShardConfig; }