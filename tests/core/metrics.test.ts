import { Counter, Gauge, Histogram, MetricsRegistry } from '../../core/metrics';

describe('Counter', () => {
  it('should increment', () => {
    const counter = new Counter('requests', 'Total requests');
    counter.inc();
    counter.inc(5);
    
    expect(counter.get().value).toBe(6);
  });

  it('should not allow negative increment', () => {
    const counter = new Counter('test', 'Test');
    expect(() => counter.inc(-1)).toThrow();
  });

  it('should reset', () => {
    const counter = new Counter('test', 'Test');
    counter.inc(10);
    counter.reset();
    
    expect(counter.get().value).toBe(0);
  });
});

describe('Gauge', () => {
  it('should set value', () => {
    const gauge = new Gauge('temperature', 'Current temp');
    gauge.set(25);
    
    expect(gauge.get().value).toBe(25);
  });

  it('should increment and decrement', () => {
    const gauge = new Gauge('connections', 'Active connections');
    gauge.inc();
    gauge.inc(2);
    gauge.dec();
    
    expect(gauge.get().value).toBe(2);
  });
});

describe('Histogram', () => {
  it('should observe values', () => {
    const histogram = new Histogram('latency', 'Request latency', [0.1, 0.5, 1, 5]);
    histogram.observe(0.3);
    histogram.observe(0.7);
    histogram.observe(2);
    
    const result = histogram.get();
    expect(result.count).toBe(3);
    expect(result.sum).toBe(3);
  });

  it('should time async functions', async () => {
    const histogram = new Histogram('duration', 'Duration');
    
    const result = await histogram.time(async () => {
      await new Promise(r => setTimeout(r, 10));
      return 'done';
    });
    
    expect(result).toBe('done');
    expect(histogram.get().count).toBe(1);
  });
});

describe('MetricsRegistry', () => {
  it('should create and reuse metrics', () => {
    const registry = new MetricsRegistry();
    
    const counter1 = registry.counter('requests', 'Requests');
    const counter2 = registry.counter('requests', 'Requests');
    
    expect(counter1).toBe(counter2);
  });

  it('should get all metrics', () => {
    const registry = new MetricsRegistry();
    registry.counter('c1', 'Counter 1').inc();
    registry.gauge('g1', 'Gauge 1').set(5);
    
    const all = registry.getAll();
    expect(Object.keys(all.counters).length).toBe(1);
    expect(Object.keys(all.gauges).length).toBe(1);
  });
});
