/**
 * @jest-environment node
 */
import { Counter, Gauge, Histogram, MetricsRegistry, startTimer } from '../../src/core/metrics';

describe('Counter', () => {
  it('should increment', () => {
    const counter = new Counter('test_counter', 'Test counter');
    counter.inc();
    counter.inc();
    expect(counter.get()).toBe(2);
  });

  it('should increment by value', () => {
    const counter = new Counter('test_counter', 'Test counter');
    counter.inc({}, 5);
    expect(counter.get()).toBe(5);
  });

  it('should handle labels', () => {
    const counter = new Counter('test_counter', 'Test counter');
    counter.inc({ method: 'GET' });
    counter.inc({ method: 'POST' });
    expect(counter.get({ method: 'GET' })).toBe(1);
    expect(counter.get({ method: 'POST' })).toBe(1);
  });

  it('should reset', () => {
    const counter = new Counter('test_counter', 'Test counter');
    counter.inc();
    counter.reset();
    expect(counter.get()).toBe(0);
  });

  it('should collect metrics', () => {
    const counter = new Counter('test_counter', 'Test counter');
    counter.inc();
    const metric = counter.collect();
    expect(metric.name).toBe('test_counter');
    expect(metric.type).toBe('counter');
  });
});

describe('Gauge', () => {
  it('should set value', () => {
    const gauge = new Gauge('test_gauge', 'Test gauge');
    gauge.set(10);
    expect(gauge.get()).toBe(10);
  });

  it('should increment and decrement', () => {
    const gauge = new Gauge('test_gauge', 'Test gauge');
    gauge.inc();
    gauge.inc();
    gauge.dec();
    expect(gauge.get()).toBe(1);
  });

  it('should handle labels', () => {
    const gauge = new Gauge('test_gauge', 'Test gauge');
    gauge.set(10, { host: 'a' });
    gauge.set(20, { host: 'b' });
    expect(gauge.get({ host: 'a' })).toBe(10);
    expect(gauge.get({ host: 'b' })).toBe(20);
  });
});

describe('Histogram', () => {
  it('should observe values', () => {
    const histogram = new Histogram('test_histogram', 'Test histogram');
    histogram.observe(0.1);
    histogram.observe(0.5);
    histogram.observe(1.5);
    const metric = histogram.collect();
    expect(metric.type).toBe('histogram');
  });

  it('should use custom buckets', () => {
    const histogram = new Histogram('test_histogram', 'Test histogram', [1, 5, 10]);
    histogram.observe(3);
    expect(histogram.collect().name).toBe('test_histogram');
  });
});

describe('MetricsRegistry', () => {
  it('should create counters', () => {
    const registry = new MetricsRegistry();
    const counter = registry.counter('requests', 'Total requests');
    counter.inc();
    expect(counter.get()).toBe(1);
  });

  it('should create gauges', () => {
    const registry = new MetricsRegistry();
    const gauge = registry.gauge('connections', 'Active connections');
    gauge.set(5);
    expect(gauge.get()).toBe(5);
  });

  it('should return same metric for same name', () => {
    const registry = new MetricsRegistry();
    const c1 = registry.counter('test', 'Test');
    const c2 = registry.counter('test', 'Test');
    expect(c1).toBe(c2);
  });

  it('should collect all metrics', () => {
    const registry = new MetricsRegistry();
    registry.counter('c1', 'Counter 1');
    registry.gauge('g1', 'Gauge 1');
    const metrics = registry.collect();
    expect(metrics.length).toBe(2);
  });
});

describe('startTimer', () => {
  it('should return elapsed time in seconds', async () => {
    const end = startTimer();
    await new Promise(r => setTimeout(r, 50));
    const elapsed = end();
    expect(elapsed).toBeGreaterThan(0.04);
    expect(elapsed).toBeLessThan(0.2);
  });
});
