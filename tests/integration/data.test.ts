/**
 * Integration test for data patterns
 */
import { ShardManager } from '../../src/sharding';
import { CDNCache } from '../../src/cdn';
import { StreamProcessor } from '../../src/streamProcessing';
describe('Data Integration', () => {
  it('should shard data', () => {
    const manager = new ShardManager({ shardCount: 4 });
    const shard = manager.getShardForKey('user-123');
    expect(shard.id).toBeGreaterThanOrEqual(0);
  });
  it('should cache data', () => {
    const cache = new CDNCache();
    cache.set('key', 'value', 10000);
    expect(cache.get('key')).toBe('value');
  });
  it('should process streams', () => {
    const stream = new StreamProcessor<number>({ windowSize: 3, slideInterval: 1 });
    stream.push(1); stream.push(2); stream.push(3);
    expect(stream.window()).toEqual([1, 2, 3]);
  });
});
