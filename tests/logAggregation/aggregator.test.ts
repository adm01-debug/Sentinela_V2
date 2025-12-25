import { LogAggregator } from '../../logAggregation';
describe('LogAggregator', () => {
  let agg: LogAggregator;
  beforeEach(() => { agg = new LogAggregator(); });
  it('should aggregate and query logs', () => {
    agg.add({ level: 'info', message: 'test', timestamp: Date.now() });
    agg.add({ level: 'error', message: 'fail', timestamp: Date.now() });
    expect(agg.query({ level: 'error' }).length).toBe(1);
    expect(agg.count()).toBe(2);
  });
});
