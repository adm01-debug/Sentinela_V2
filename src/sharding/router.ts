import { ShardConfig, ShardKey, ShardingStrategy } from './types';

export class ShardRouter {
  constructor(private strategy: ShardingStrategy, private shards: ShardConfig[]) {}
  
  route(key: string): ShardConfig {
    const shardKey: ShardKey = { value: key, hash: this.hash(key) };
    return this.strategy.getShard(shardKey, this.shards.filter(s => s.status === 'active'));
  }
  
  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    return Math.abs(hash);
  }
}

export class HashStrategy implements ShardingStrategy {
  getShard(key: ShardKey, shards: ShardConfig[]): ShardConfig {
    const index = key.hash % shards.length;
    return shards[index];
  }
}

export class RangeStrategy implements ShardingStrategy {
  getShard(key: ShardKey, shards: ShardConfig[]): ShardConfig {
    for (const shard of shards) {
      if (key.value >= shard.minKey && key.value <= shard.maxKey) return shard;
    }
    return shards[0];
  }
}

export class ConsistentHashStrategy implements ShardingStrategy {
  private ring: { hash: number; shard: ShardConfig }[] = [];
  private virtualNodes: number = 100;
  
  initialize(shards: ShardConfig[]): void {
    this.ring = [];
    shards.forEach(shard => {
      for (let i = 0; i < this.virtualNodes; i++) {
        this.ring.push({ hash: this.hash(shard.shardId + i), shard });
      }
    });
    this.ring.sort((a, b) => a.hash - b.hash);
  }
  
  getShard(key: ShardKey, shards: ShardConfig[]): ShardConfig {
    if (this.ring.length === 0) this.initialize(shards);
    for (const node of this.ring) {
      if (key.hash <= node.hash) return node.shard;
    }
    return this.ring[0].shard;
  }
  
  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    return Math.abs(hash);
  }
}