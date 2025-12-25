import { Pool } from '../../core/pool';
describe('Pool', () => {
  it('should acquire and release', async () => {
    let created = 0;
    const pool = new Pool({ create: async () => ({ id: ++created }) });
    const item = await pool.acquire();
    expect(item.id).toBe(1);
    await pool.release(item);
    const item2 = await pool.acquire();
    expect(item2.id).toBe(1);
  });
});
