import { ConnectionPool, PooledConnection } from '../../connectionPool';

describe('ConnectionPool', () => {
  let pool: ConnectionPool;

  beforeEach(() => {
    pool = new ConnectionPool({
      minSize: 2,
      maxSize: 10,
      acquireTimeout: 5000,
      idleTimeout: 30000,
      factory: () => Promise.resolve({ id: Math.random().toString() })
    });
  });

  afterEach(async () => {
    await pool.drain();
  });

  it('should acquire connection', async () => {
    const conn = await pool.acquire();
    expect(conn).toBeDefined();
    expect(conn.id).toBeDefined();
  });

  it('should release connection back to pool', async () => {
    const conn = await pool.acquire();
    const initialSize = pool.size;
    
    await pool.release(conn);
    expect(pool.available).toBeGreaterThanOrEqual(1);
  });

  it('should respect max size', async () => {
    const connections = [];
    
    for (let i = 0; i < 10; i++) {
      connections.push(await pool.acquire());
    }

    expect(pool.size).toBe(10);
    
    // Release all
    for (const conn of connections) {
      await pool.release(conn);
    }
  });

  it('should get pool stats', () => {
    const stats = pool.stats();
    
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('available');
    expect(stats).toHaveProperty('pending');
  });
});
