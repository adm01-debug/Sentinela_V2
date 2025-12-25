import { Tracer } from '../../distributedTracing';
describe('Tracer', () => {
  let tracer: Tracer;
  beforeEach(() => { tracer = new Tracer('test-service'); });
  it('should create spans', () => {
    const span = tracer.startSpan('operation');
    expect(span.id).toBeDefined();
    expect(span.name).toBe('operation');
    tracer.endSpan(span);
    expect(span.endTime).toBeDefined();
  });
  it('should support parent spans', () => {
    const parent = tracer.startSpan('parent');
    const child = tracer.startSpan('child', { parent });
    expect(child.parentId).toBe(parent.id);
  });
});
