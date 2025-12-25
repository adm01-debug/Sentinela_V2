/**
 * Data Processing Example
 */
import { CDCCapturer } from '../src/cdc';
import { StreamProcessor } from '../src/streamProcessing';
import { PartitionManager } from '../src/partitioning';
import { QueryBuilder } from '../src/queryBuilder';
import { Replicator } from '../src/replication';

function cdcExample() {
  const cdc = new CDCCapturer();
  cdc.onChange(event => console.log('Change:', event.table, event.operation));
  cdc.emit({ table: 'users', operation: 'INSERT', after: { id: 1, name: 'John' }, timestamp: Date.now() });
  cdc.emit({ table: 'orders', operation: 'UPDATE', before: { status: 'pending' }, after: { status: 'shipped' }, timestamp: Date.now() });
}

function streamExample() {
  const stream = new StreamProcessor<number>({ windowSize: 5, slideInterval: 1 });
  [1, 2, 3, 4, 5, 6, 7].forEach(n => stream.push(n));
  console.log('Window:', stream.window());
  console.log('Sum:', stream.aggregate(items => items.reduce((a, b) => a + b, 0)));
}

function partitionExample() {
  const pm = new PartitionManager();
  pm.create(4);
  ['user-1', 'user-2', 'order-1', 'product-1'].forEach(k => console.log(k, '-> partition', pm.getPartition(k).id));
}

function queryExample() {
  const sql = new QueryBuilder()
    .select('id', 'name', 'email', 'created_at')
    .from('users')
    .where('active = true')
    .where('age >= 18')
    .orderBy('created_at DESC')
    .limit(100)
    .build();
  console.log('SQL:', sql);
}

async function replicationExample() {
  const replicator = new Replicator({ primary: 'db-primary', replicas: ['db-replica-1', 'db-replica-2'], mode: 'async' });
  const result = await replicator.replicate({ id: 1, data: 'important data' });
  console.log('Replication:', result);
}

cdcExample();
streamExample();
partitionExample();
queryExample();
replicationExample();
