/**
 * @fileoverview Shard manager
 * @module @sentinela/core/sharding
 * @version 13.0.0
 */

import { ShardConfig, ShardStatus } from './types';

export class ShardManager {
  private shards: Map<string, ShardConfig> = new Map();
  
  addShard(config: ShardConfig): void { this.shards.set(config.shardId, config); }
  removeShard(shardId: string): boolean { return this.shards.delete(shardId); }
  getShard(shardId: string): ShardConfig | undefined { return this.shards.get(shardId); }
  getActiveShards(): ShardConfig[] { return Array.from(this.shards.values()).filter(s => s.status === 'active'); }
  
  updateStatus(shardId: string, status: ShardStatus): void {
    const shard = this.shards.get(shardId);
    if (shard) shard.status = status;
  }
  
  getShardForKey(key: string): ShardConfig | undefined {
    for (const shard of this.shards.values()) {
      if (shard.status === 'active' && key >= shard.minKey && key <= shard.maxKey) return shard;
    }
    return undefined;
  }
  
  getStats(): ShardStats {
    const shards = Array.from(this.shards.values());
    return {
      total: shards.length,
      active: shards.filter(s => s.status === 'active').length,
      draining: shards.filter(s => s.status === 'draining').length,
      offline: shards.filter(s => s.status === 'offline').length
    };
  }
}

export interface ShardStats { total: number; active: number; draining: number; offline: number; }