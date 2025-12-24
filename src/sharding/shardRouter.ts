import { ShardConfig, ShardKey, ShardMapping } from './types';
import { ShardManager } from './shardManager';
import { ConsistentHash } from './consistentHash';

export class ShardRouter {
  private hashRing: ConsistentHash;
  private mappings: ShardMapping[] = [];
  
  constructor(private manager: ShardManager, private shardKey: ShardKey) {
    this.hashRing = new ConsistentHash(100);
    manager.getActiveShards().forEach(s => this.hashRing.addNode(s.shardId, s.weight));
  }
  
  route(key: unknown): string {
    switch (this.shardKey.type) {
      case 'hash': return this.hashRing.getNode(String(key));
      case 'range': return this.routeByRange(key);
      case 'list': return this.routeByList(key);
    }
  }
  
  private routeByRange(key: unknown): string {
    for (const mapping of this.mappings) {
      if (mapping.keyRange && key >= mapping.keyRange.min && key < mapping.keyRange.max) return mapping.shardId;
    }
    return this.manager.getActiveShards()[0]?.shardId ?? '';
  }
  
  private routeByList(key: unknown): string {
    for (const mapping of this.mappings) {
      if (mapping.keyList?.includes(key)) return mapping.shardId;
    }
    return this.manager.getActiveShards()[0]?.shardId ?? '';
  }
  
  addMapping(mapping: ShardMapping): void { this.mappings.push(mapping); }
  
  async scatter<T>(operation: (shardId: string) => Promise<T[]>): Promise<T[]> {
    const results = await Promise.all(this.manager.getActiveShards().map(s => operation(s.shardId)));
    return results.flat();
  }
}