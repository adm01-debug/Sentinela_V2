import { ConnectionPool } from '../../connectionPool';

describe('ConnectionPool', () => {
  let pool: ConnectionPool;
  beforeEach(() => { pool = new ConnectionPool({ minSize: 2, maxSize: 10 }); });
  afterEach(async () => { await pool.drain(); });

  it('should acquire connection', async () => {
    const conn = await pool.acquire();
    expect(conn).toBeDefined();
  });

  it('should release connection', async () => {
    const conn = await pool.acquire();
    await pool.release(conn);
    expect(pool.available()).toBeGreaterThan(0);
  });

  it('should respect max size', async () => {
    const conns = [];
    for (let i = 0; i < 10; i++) {
      conns.push(await pool.acquire());
    }
    expect(pool.size()).toBe(10);
  });
});
