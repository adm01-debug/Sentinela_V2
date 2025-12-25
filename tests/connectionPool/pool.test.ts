import { ConnectionPool } from '../../connectionPool';
describe('ConnectionPool', () => {
  it('should acquire and release connections', async () => {
    const pool = new ConnectionPool({ minSize: 2, maxSize: 5 });
    const conn = await pool.acquire();
    expect(conn.id).toBeDefined();
    await pool.release(conn);
    expect(pool.available()).toBeGreaterThan(0);
  });
  it('should respect max size', async () => {
    const pool = new ConnectionPool({ minSize: 1, maxSize: 2 });
    await pool.acquire();
    await pool.acquire();
    await expect(pool.acquire()).rejects.toThrow('Pool exhausted');
  });
});
