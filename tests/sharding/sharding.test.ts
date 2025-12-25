import { ShardManager, ShardStrategy, ConsistentHashSharding } from '../../sharding';

describe('ShardManager', () => {
  let manager: ShardManager;

  beforeEach(() => {
    manager = new ShardManager({
      shards: ['shard-1', 'shard-2', 'shard-3'],
      strategy: 'consistent-hash'
    });
  });

  it('should get shard for key', () => {
    const shard1 = manager.getShard('user-123');
    const shard2 = manager.getShard('user-456');

    expect(shard1).toBeDefined();
    expect(['shard-1', 'shard-2', 'shard-3']).toContain(shard1);
  });

  it('should return same shard for same key', () => {
    const shard1 = manager.getShard('consistent-key');
    const shard2 = manager.getShard('consistent-key');

    expect(shard1).toBe(shard2);
  });

  it('should distribute keys across shards', () => {
    const distribution = new Map<string, number>();
    
    for (let i = 0; i < 1000; i++) {
      const shard = manager.getShard(`key-${i}`);
      distribution.set(shard, (distribution.get(shard) || 0) + 1);
    }

    // Should have some distribution (not all in one shard)
    expect(distribution.size).toBeGreaterThan(1);
  });
});

describe('ConsistentHashSharding', () => {
  let strategy: ConsistentHashSharding;

  beforeEach(() => {
    strategy = new ConsistentHashSharding(['node-1', 'node-2', 'node-3']);
  });

  it('should return consistent node for key', () => {
    const node1 = strategy.getNode('test-key');
    const node2 = strategy.getNode('test-key');

    expect(node1).toBe(node2);
  });

  it('should add node', () => {
    strategy.addNode('node-4');
    const nodes = strategy.getNodes();
    
    expect(nodes).toContain('node-4');
  });

  it('should remove node', () => {
    strategy.removeNode('node-2');
    const nodes = strategy.getNodes();
    
    expect(nodes).not.toContain('node-2');
  });
});
