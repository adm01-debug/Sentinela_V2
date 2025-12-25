import { Tracer, Span } from '../../distributedTracing';

describe('Tracer', () => {
  let tracer: Tracer;
  beforeEach(() => { tracer = new Tracer({ serviceName: 'test-service' }); });

  it('should create spans', () => {
    const span = tracer.startSpan('operation');
    expect(span).toBeDefined();
    expect(span.traceId).toBeDefined();
    span.end();
  });

  it('should create child spans', () => {
    const parent = tracer.startSpan('parent');
    const child = tracer.startSpan('child', { parent });
    expect(child.parentId).toBe(parent.spanId);
    child.end();
    parent.end();
  });

  it('should add tags and logs', () => {
    const span = tracer.startSpan('operation');
    span.setTag('http.method', 'GET');
    span.log('request received');
    expect(span.tags['http.method']).toBe('GET');
    span.end();
  });
});
