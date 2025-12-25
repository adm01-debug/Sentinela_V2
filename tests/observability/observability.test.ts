import { LogAggregator, DistributedTracer, MetricsCollector } from '../../logAggregation';

describe('LogAggregator', () => {
  let aggregator: LogAggregator;

  beforeEach(() => {
    aggregator = new LogAggregator({
      bufferSize: 100,
      flushInterval: 1000
    });
  });

  afterEach(() => {
    aggregator.stop();
  });

  it('should aggregate logs', () => {
    aggregator.log({ level: 'info', message: 'Test 1', timestamp: new Date() });
    aggregator.log({ level: 'error', message: 'Test 2', timestamp: new Date() });

    const logs = aggregator.getLogs();
    expect(logs.length).toBe(2);
  });

  it('should filter logs by level', () => {
    aggregator.log({ level: 'debug', message: 'Debug', timestamp: new Date() });
    aggregator.log({ level: 'error', message: 'Error', timestamp: new Date() });

    const errors = aggregator.getLogs({ level: 'error' });
    expect(errors.length).toBe(1);
  });

  it('should search logs', () => {
    aggregator.log({ level: 'info', message: 'User login', timestamp: new Date() });
    aggregator.log({ level: 'info', message: 'User logout', timestamp: new Date() });

    const results = aggregator.search('login');
    expect(results.length).toBe(1);
  });
});

describe('DistributedTracer', () => {
  let tracer: DistributedTracer;

  beforeEach(() => {
    tracer = new DistributedTracer({ serviceName: 'test-service' });
  });

  it('should create span', () => {
    const span = tracer.startSpan('test-operation');
    expect(span.traceId).toBeDefined();
    expect(span.spanId).toBeDefined();
  });

  it('should create child spans', () => {
    const parent = tracer.startSpan('parent');
    const child = tracer.startSpan('child', { parent });

    expect(child.parentSpanId).toBe(parent.spanId);
    expect(child.traceId).toBe(parent.traceId);
  });

  it('should record span duration', () => {
    const span = tracer.startSpan('timed');
    span.end();

    expect(span.duration).toBeDefined();
    expect(span.duration).toBeGreaterThanOrEqual(0);
  });

  it('should add tags to span', () => {
    const span = tracer.startSpan('tagged');
    span.setTag('http.method', 'GET');
    span.setTag('http.status', 200);

    expect(span.tags['http.method']).toBe('GET');
  });
});

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector({ prefix: 'test' });
  });

  it('should increment counter', () => {
    collector.increment('requests', { method: 'GET' });
    collector.increment('requests', { method: 'GET' });

    const value = collector.getCounter('requests', { method: 'GET' });
    expect(value).toBe(2);
  });

  it('should record gauge', () => {
    collector.gauge('memory', 1024, { unit: 'MB' });
    collector.gauge('memory', 2048, { unit: 'MB' });

    const value = collector.getGauge('memory', { unit: 'MB' });
    expect(value).toBe(2048);
  });

  it('should record histogram', () => {
    collector.histogram('latency', 100);
    collector.histogram('latency', 200);
    collector.histogram('latency', 150);

    const stats = collector.getHistogramStats('latency');
    expect(stats.count).toBe(3);
    expect(stats.avg).toBe(150);
  });
});
