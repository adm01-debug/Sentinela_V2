import { Tracer, SpanBuilder, TraceContextPropagator } from '../../src/distributedTracing';

describe('Tracer', () => {
  let tracer: Tracer;

  beforeEach(() => {
    tracer = new Tracer({ serviceName: 'test-service' });
  });

  it('should create trace', () => {
    const trace = tracer.startTrace('operation');
    
    expect(trace.traceId).toBeDefined();
    expect(trace.spanId).toBeDefined();
  });

  it('should create child spans', () => {
    const parent = tracer.startTrace('parent');
    const child = tracer.startSpan('child', parent.traceId, parent.spanId);
    
    expect(child.traceId).toBe(parent.traceId);
    expect(child.parentSpanId).toBe(parent.spanId);
  });

  it('should end spans with duration', () => {
    const span = tracer.startTrace('timed');
    
    // Simulate work
    const start = Date.now();
    while (Date.now() - start < 10) {}
    
    tracer.endSpan(span);
    expect(span.duration).toBeGreaterThan(0);
  });
});

describe('SpanBuilder', () => {
  it('should build span with tags', () => {
    const span = new SpanBuilder('http-request')
      .tag('http.method', 'GET')
      .tag('http.url', '/api/users')
      .tag('http.status_code', 200)
      .log('Request completed')
      .build();

    expect(span.tags['http.method']).toBe('GET');
    expect(span.logs.length).toBe(1);
  });
});

describe('TraceContextPropagator', () => {
  it('should inject trace context into headers', () => {
    const propagator = new TraceContextPropagator();
    const headers: Record<string, string> = {};
    
    propagator.inject({
      traceId: 'abc123',
      spanId: 'def456'
    }, headers);

    expect(headers['traceparent']).toBeDefined();
  });

  it('should extract trace context from headers', () => {
    const propagator = new TraceContextPropagator();
    const headers = {
      'traceparent': '00-abc123-def456-01'
    };
    
    const context = propagator.extract(headers);
    expect(context).toBeDefined();
  });
});
