import { MetricsCollector } from '../../metricsCollection';
describe('MetricsCollector', () => {
  let collector: MetricsCollector;
  beforeEach(() => { collector = new MetricsCollector(); });
  it('should record and get metrics', () => {
    collector.record('cpu', 75);
    collector.increment('requests');
    collector.increment('requests');
    expect(collector.get('cpu')).toBe(75);
    expect(collector.get('requests')).toBe(2);
  });
});
