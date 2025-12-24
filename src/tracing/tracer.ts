export interface Span { id: string; traceId: string; parentId?: string; name: string; startTime: number; endTime?: number; attributes: Record<string, any>; status: 'ok' | 'error'; }
export class Tracer {
  private spans = new Map<string, Span>();
  startSpan(name: string, parentId?: string): Span { const span: Span = { id: crypto.randomUUID(), traceId: parentId ? this.spans.get(parentId)?.traceId || crypto.randomUUID() : crypto.randomUUID(), parentId, name, startTime: performance.now(), attributes: {}, status: 'ok' }; this.spans.set(span.id, span); return span; }
  endSpan(spanId: string, status: 'ok' | 'error' = 'ok'): void { const span = this.spans.get(spanId); if (span) { span.endTime = performance.now(); span.status = status; } }
  getSpan(id: string): Span | undefined { return this.spans.get(id); }
  getTrace(traceId: string): Span[] { return Array.from(this.spans.values()).filter(s => s.traceId === traceId); }
}
export const tracer = new Tracer();
