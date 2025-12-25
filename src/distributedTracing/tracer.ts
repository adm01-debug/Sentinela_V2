/**
 * @fileoverview Distributed Tracer
 * @module @sentinela/core/distributedTracing
 * @version 13.0.0
 */
export interface Span { id: string; name: string; parentId?: string; startTime: number; endTime?: number; tags: Record<string, string>; }
export class Tracer {
  private spans: Span[] = [];
  private idCounter = 0;
  constructor(private serviceName: string) {}
  startSpan(name: string, opts?: { parent?: Span }): Span {
    const span: Span = { id: String(++this.idCounter), name, parentId: opts?.parent?.id, startTime: Date.now(), tags: { service: this.serviceName } };
    this.spans.push(span);
    return span;
  }
  endSpan(span: Span): void { span.endTime = Date.now(); }
}
