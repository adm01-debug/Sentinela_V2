import { Bulkhead } from '../../bulkhead';
describe('Bulkhead', () => {
  it('should limit concurrent executions', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 2 });
    let concurrent = 0;
    let maxConcurrent = 0;
    const task = async () => { concurrent++; maxConcurrent = Math.max(maxConcurrent, concurrent); await new Promise(r => setTimeout(r, 10)); concurrent--; };
    await Promise.all([bulkhead.execute(task), bulkhead.execute(task), bulkhead.execute(task)]);
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });
});
