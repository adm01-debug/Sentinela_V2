/**
 * Resilience Patterns Example
 */
import { Bulkhead } from '../src/bulkhead';
import { BackpressureController } from '../src/backpressure';
import { ShardManager } from '../src/sharding';
import { ConnectionPool } from '../src/connectionPool';

async function bulkheadExample() {
  const bulkhead = new Bulkhead({ maxConcurrent: 5, maxQueue: 10 });
  const results = await Promise.all(
    Array(10).fill(0).map((_, i) => 
      bulkhead.execute(async () => { await new Promise(r => setTimeout(r, 100)); return i; })
    )
  );
  console.log('Bulkhead results:', results);
}

function backpressureExample() {
  const ctrl = new BackpressureController({ highWaterMark: 100, lowWaterMark: 50 });
  for (let i = 0; i < 100; i++) ctrl.increment();
  console.log('Should pause:', ctrl.shouldPause());
  for (let i = 0; i < 60; i++) ctrl.decrement();
  console.log('Should resume:', ctrl.shouldResume());
}

function shardingExample() {
  const manager = new ShardManager({ shardCount: 8 });
  const keys = ['user-1', 'user-2', 'user-3', 'order-1', 'order-2'];
  keys.forEach(k => console.log(k, '-> shard', manager.getShardForKey(k)));
}

async function poolExample() {
  const pool = new ConnectionPool({ minSize: 2, maxSize: 10 });
  const conn = await pool.acquire();
  console.log('Acquired connection:', conn.id);
  await pool.release(conn);
}

bulkheadExample();
backpressureExample();
shardingExample();
poolExample();
