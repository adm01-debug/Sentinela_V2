/**
 * @fileoverview Distributed Tracer
 * @module @sentinela/core/distributedTracing
 */
export interface Span { id: string; name: string; parentId?: string; startTime: number; endTime?: number; tags: Record<string, string>; }
export class Tracer {
  private spans: Span[] = [];
  private idCounter = 0;
  constructor(private serviceName: string) {}
  startSpan(name: string, options?: { parent?: Span }): Span {
    const span: Span = { id: 'span_' + (++this.idCounter), name, parentId: options?.parent?.id, startTime: Date.now(), tags: {} };
    this.spans.push(span);
    return span;
  }
  endSpan(span: Span): void { span.endTime = Date.now(); }
}
