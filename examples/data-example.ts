/**
 * Data patterns example
 */
import { ShardManager, ConsistentHashing } from '../src/sharding';
import { Replicator } from '../src/replication';
import { CDNCache } from '../src/cdn';
import { StreamProcessor } from '../src/streamProcessing';
const shards = new ShardManager({ shardCount: 4 });
const replicator = new Replicator({ primary: 'db1', replicas: ['db2', 'db3'], mode: 'async' });
const cdn = new CDNCache();
const stream = new StreamProcessor<number>({ windowSize: 100, slideInterval: 10 });
async function storeData(key: string, value: unknown) {
  const shard = shards.getShardForKey(key);
  cdn.set(key, value, 3600000);
  await replicator.replicate({ key, value, shard: shard.id });
}
