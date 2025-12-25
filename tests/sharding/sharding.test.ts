import { ShardManager, ConsistentHashing } from '../../sharding';

describe('ShardManager', () => {
  let manager: ShardManager;
  beforeEach(() => { manager = new ShardManager({ shardCount: 4 }); });

  it('should determine shard for key', () => {
    const shard = manager.getShardForKey('user-123');
    expect(shard).toBeGreaterThanOrEqual(0);
    expect(shard).toBeLessThan(4);
  });

  it('should consistently map same key to same shard', () => {
    const s1 = manager.getShardForKey('user-123');
    const s2 = manager.getShardForKey('user-123');
    expect(s1).toBe(s2);
  });
});

describe('ConsistentHashing', () => {
  it('should distribute keys across nodes', () => {
    const hasher = new ConsistentHashing(['node1', 'node2', 'node3']);
    const node = hasher.getNode('key1');
    expect(['node1', 'node2', 'node3']).toContain(node);
  });
});
