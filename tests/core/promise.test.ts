import { delay, timeout, retry } from '../../core/promise';
describe('Promise', () => {
  it('should delay', async () => { const start = Date.now(); await delay(50); expect(Date.now() - start).toBeGreaterThanOrEqual(50); });
  it('should timeout', async () => { await expect(timeout(delay(100), 50)).rejects.toThrow('Timeout'); });
  it('should retry', async () => { let attempts = 0; await retry(async () => { attempts++; if (attempts < 3) throw new Error(); }, 3); expect(attempts).toBe(3); });
});
