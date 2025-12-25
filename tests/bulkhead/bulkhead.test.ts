import { Bulkhead, BulkheadConfig } from '../../bulkhead';

describe('Bulkhead', () => {
  let bulkhead: Bulkhead;

  beforeEach(() => {
    bulkhead = new Bulkhead({
      name: 'test-bulkhead',
      maxConcurrent: 3,
      maxQueued: 5,
      timeout: 5000
    });
  });

  afterEach(() => {
    bulkhead.dispose();
  });

  it('should allow concurrent executions up to limit', async () => {
    const results = await Promise.all([
      bulkhead.execute(() => Promise.resolve('a')),
      bulkhead.execute(() => Promise.resolve('b')),
      bulkhead.execute(() => Promise.resolve('c'))
    ]);

    expect(results).toEqual(['a', 'b', 'c']);
  });

  it('should queue requests over concurrent limit', async () => {
    const delays = [100, 100, 100, 50, 50];
    const start = Date.now();

    await Promise.all(
      delays.map(d => 
        bulkhead.execute(() => new Promise(r => setTimeout(() => r(d), d)))
      )
    );

    // Should have taken time for queued requests
    expect(Date.now() - start).toBeGreaterThan(100);
  });

  it('should reject when queue is full', async () => {
    const pending = [];
    
    // Fill concurrent slots
    for (let i = 0; i < 3; i++) {
      pending.push(bulkhead.execute(() => new Promise(r => setTimeout(r, 1000))));
    }
    
    // Fill queue
    for (let i = 0; i < 5; i++) {
      pending.push(bulkhead.execute(() => new Promise(r => setTimeout(r, 1000))));
    }

    // This should reject
    await expect(
      bulkhead.execute(() => Promise.resolve('overflow'))
    ).rejects.toThrow('Bulkhead queue full');
  });

  it('should track metrics', async () => {
    await bulkhead.execute(() => Promise.resolve('test'));
    
    const metrics = bulkhead.getMetrics();
    expect(metrics.successful).toBe(1);
    expect(metrics.concurrent).toBe(0);
  });
});
