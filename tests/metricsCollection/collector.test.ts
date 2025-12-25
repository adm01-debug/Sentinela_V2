import { MetricCollector, MetricAggregator } from '../../src/metricsCollection';

describe('MetricCollector', () => {
  let collector: MetricCollector;

  beforeEach(() => {
    collector = new MetricCollector();
  });

  it('should collect counter metric', () => {
    collector.counter('requests_total', { method: 'GET' });
    collector.counter('requests_total', { method: 'GET' });
    collector.counter('requests_total', { method: 'POST' });

    const metrics = collector.collect();
    expect(metrics.length).toBeGreaterThan(0);
  });

  it('should collect gauge metric', () => {
    collector.gauge('temperature', 25.5, { location: 'server-room' });
    
    const metrics = collector.collect();
    const temp = metrics.find(m => m.name === 'temperature');
    expect(temp).toBeDefined();
  });

  it('should collect histogram metric', () => {
    collector.histogram('request_duration', 0.1);
    collector.histogram('request_duration', 0.5);
    collector.histogram('request_duration', 1.2);

    const metrics = collector.collect();
    const hist = metrics.find(m => m.name === 'request_duration');
    expect(hist).toBeDefined();
  });
});

describe('MetricAggregator', () => {
  it('should aggregate metrics', () => {
    const aggregator = new MetricAggregator();
    
    aggregator.add('cpu', 50);
    aggregator.add('cpu', 60);
    aggregator.add('cpu', 70);

    const stats = aggregator.getStats('cpu');
    expect(stats.avg).toBe(60);
    expect(stats.min).toBe(50);
    expect(stats.max).toBe(70);
  });

  it('should calculate percentiles', () => {
    const aggregator = new MetricAggregator();
    
    for (let i = 1; i <= 100; i++) {
      aggregator.add('latency', i);
    }

    const p50 = aggregator.percentile('latency', 50);
    const p99 = aggregator.percentile('latency', 99);
    
    expect(p50).toBeCloseTo(50, 0);
    expect(p99).toBeCloseTo(99, 0);
  });
});
