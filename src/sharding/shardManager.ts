/**
 * @fileoverview Sharding implementation
 * @module @sentinela/core/sharding
 * @version 13.0.0
 */

export interface ShardingConfig {
  shardCount: number;
  hashFunction?: (key: string) => number;
}

export class ShardManager {
  private readonly shardCount: number;
  private readonly hashFn: (key: string) => number;

  constructor(config: ShardingConfig) {
    this.shardCount = config.shardCount;
    this.hashFn = config.hashFunction ?? this.defaultHash;
  }

  private defaultHash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  getShardForKey(key: string): number {
    return this.hashFn(key) % this.shardCount;
  }

  getShardRange(shardId: number): { start: number; end: number } {
    const rangeSize = Math.floor(0xFFFFFFFF / this.shardCount);
    return {
      start: shardId * rangeSize,
      end: (shardId + 1) * rangeSize - 1
    };
  }
}

export class ConsistentHashing {
  private ring: Array<{ hash: number; node: string }> = [];
  private readonly replicas: number;

  constructor(nodes: string[], replicas = 100) {
    this.replicas = replicas;
    for (const node of nodes) {
      this.addNode(node);
    }
  }

  addNode(node: string): void {
    for (let i = 0; i < this.replicas; i++) {
      const hash = this.hash(node + ':' + i);
      this.ring.push({ hash, node });
    }
    this.ring.sort((a, b) => a.hash - b.hash);
  }

  removeNode(node: string): void {
    this.ring = this.ring.filter(r => r.node !== node);
  }

  getNode(key: string): string {
    if (this.ring.length === 0) throw new Error('No nodes');
    const hash = this.hash(key);
    const entry = this.ring.find(r => r.hash >= hash) ?? this.ring[0];
    return entry.node;
  }

  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
