import { ShardManager, ShardingStrategy } from '../../src/sharding';

describe('ShardManager', () => {
  let manager: ShardManager;

  beforeEach(() => {
    manager = new ShardManager({
      shardCount: 4,
      strategy: 'hash'
    });
  });

  it('should determine shard for key', () => {
    const shard1 = manager.getShard('user-123');
    const shard2 = manager.getShard('user-456');
    
    expect(shard1).toBeGreaterThanOrEqual(0);
    expect(shard1).toBeLessThan(4);
    expect(shard2).toBeGreaterThanOrEqual(0);
  });

  it('should be consistent for same key', () => {
    const shard1 = manager.getShard('consistent-key');
    const shard2 = manager.getShard('consistent-key');
    
    expect(shard1).toBe(shard2);
  });

  it('should distribute keys across shards', () => {
    const shardCounts = new Map<number, number>();
    
    for (let i = 0; i < 1000; i++) {
      const shard = manager.getShard('key-' + i);
      shardCounts.set(shard, (shardCounts.get(shard) ?? 0) + 1);
    }

    // All shards should have some keys
    expect(shardCounts.size).toBe(4);
  });
});
