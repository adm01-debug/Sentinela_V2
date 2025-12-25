import { LogAggregator } from '../../logAggregation';
describe('LogAggregator', () => {
  it('should aggregate logs', async () => {
    const agg = new LogAggregator();
    agg.add({ level: 'info', message: 'test', timestamp: Date.now() });
    expect(agg.count()).toBe(1);
  });
});
