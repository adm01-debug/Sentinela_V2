import { SpanContext, spanContextManager } from './spanContext';
export type PropagatorType = 'w3c' | 'b3' | 'jaeger';
export class Propagator {
  private type: PropagatorType = 'w3c';
  setType(type: PropagatorType): void { this.type = type; }
  inject(headers: Record<string, string>): void { const context = spanContextManager.get(); if (!context) return; switch (this.type) { case 'w3c': headers['traceparent'] = spanContextManager.toHeader(); break; case 'b3': headers['X-B3-TraceId'] = context.traceId; headers['X-B3-SpanId'] = context.spanId; break; } }
  extract(headers: Record<string, string>): SpanContext | null { switch (this.type) { case 'w3c': return headers['traceparent'] ? spanContextManager.fromHeader(headers['traceparent']) : null; case 'b3': return headers['X-B3-TraceId'] ? { traceId: headers['X-B3-TraceId'], spanId: headers['X-B3-SpanId'] || '', traceFlags: 1 } : null; default: return null; } }
}
export const propagator = new Propagator();
