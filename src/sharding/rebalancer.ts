import { ShardConfig } from './types';
import { ShardManager } from './shardManager';

export class ShardRebalancer {
  constructor(private manager: ShardManager) {}
  
  async rebalance(): Promise<RebalanceResult> {
    const shards = this.manager.getActiveShards();
    if (shards.length < 2) return { moved: 0, operations: [] };
    
    const operations: RebalanceOperation[] = [];
    // Simplified rebalancing logic
    return { moved: operations.length, operations };
  }
  
  async splitShard(shardId: string): Promise<SplitResult> {
    const shard = this.manager.getShard(shardId);
    if (!shard) throw new Error('Shard not found');
    
    const midKey = this.calculateMidpoint(shard.minKey, shard.maxKey);
    const newShardId = shardId + '_split';
    
    return { originalShard: shardId, newShard: newShardId, splitKey: midKey };
  }
  
  private calculateMidpoint(min: string, max: string): string {
    return min + max.charAt(0);
  }
}

export interface RebalanceResult { moved: number; operations: RebalanceOperation[]; }
export interface RebalanceOperation { type: 'move' | 'split' | 'merge'; source: string; target: string; keys?: string[]; }
export interface SplitResult { originalShard: string; newShard: string; splitKey: string; }