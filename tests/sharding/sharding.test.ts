import { ShardManager, ConsistentHashing } from '../../sharding';
describe('ShardManager', () => {
  it('should distribute keys to shards', () => {
    const manager = new ShardManager({ shardCount: 4 });
    const shard1 = manager.getShardForKey('user-123');
    const shard2 = manager.getShardForKey('user-456');
    expect(shard1).toBeGreaterThanOrEqual(0);
    expect(shard1).toBeLessThan(4);
  });
});
describe('ConsistentHashing', () => {
  it('should route to nodes', () => {
    const hash = new ConsistentHashing(['node1', 'node2', 'node3']);
    const node = hash.getNode('key-123');
    expect(['node1', 'node2', 'node3']).toContain(node);
  });
});
