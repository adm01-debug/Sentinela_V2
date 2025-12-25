import { Bulkhead } from '../../bulkhead';

describe('Bulkhead', () => {
  let bulkhead: Bulkhead;
  beforeEach(() => { bulkhead = new Bulkhead({ maxConcurrent: 2, maxQueue: 5 }); });

  it('should allow execution within limit', async () => {
    const result = await bulkhead.execute(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('should queue when at capacity', async () => {
    const slow = () => new Promise(r => setTimeout(() => r('done'), 100));
    const p1 = bulkhead.execute(slow);
    const p2 = bulkhead.execute(slow);
    const p3 = bulkhead.execute(slow);
    const results = await Promise.all([p1, p2, p3]);
    expect(results).toEqual(['done', 'done', 'done']);
  });

  it('should reject when queue full', async () => {
    const slow = () => new Promise(r => setTimeout(() => r('done'), 1000));
    for (let i = 0; i < 7; i++) { bulkhead.execute(slow).catch(() => {}); }
    await expect(bulkhead.execute(slow)).rejects.toThrow();
  });
});
