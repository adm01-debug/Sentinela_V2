/**
 * Integration test for observability
 */
import { Tracer } from '../../src/distributedTracing';
import { LogAggregator } from '../../src/logAggregation';
import { MetricsCollector } from '../../src/metricsCollection';
describe('Observability Integration', () => {
  it('should trace requests', () => {
    const tracer = new Tracer('test');
    const span = tracer.startSpan('op');
    tracer.endSpan(span);
    expect(span.endTime).toBeDefined();
  });
  it('should aggregate logs', () => {
    const logs = new LogAggregator();
    logs.add({ level: 'info', message: 'test', timestamp: Date.now() });
    expect(logs.count()).toBe(1);
  });
  it('should collect metrics', () => {
    const metrics = new MetricsCollector();
    metrics.increment('requests');
    expect(metrics.get('requests')).toBe(1);
  });
});
