import { ConnectionPool, PoolConfig } from '../../src/connectionPool';

describe('ConnectionPool', () => {
  it('should create pool with config', () => {
    const pool = new ConnectionPool({
      minConnections: 2,
      maxConnections: 10,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 30000
    });

    expect(pool).toBeDefined();
  });

  it('should acquire and release connections', async () => {
    const pool = new ConnectionPool({
      minConnections: 1,
      maxConnections: 5,
      acquireTimeoutMs: 1000,
      idleTimeoutMs: 10000
    });

    const conn = await pool.acquire();
    expect(conn).toBeDefined();

    pool.release(conn);
    const stats = pool.getStats();
    expect(stats.available).toBeGreaterThan(0);
  });
});
