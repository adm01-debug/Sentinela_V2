import { MetricsCollector } from '../../metricsCollection';
describe('MetricsCollector', () => {
  it('should collect metrics', async () => {
    const collector = new MetricsCollector();
    collector.record('cpu', 75);
    const metrics = collector.getAll();
    expect(metrics.cpu).toBe(75);
  });
});
