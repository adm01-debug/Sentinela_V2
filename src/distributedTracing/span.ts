import { Span, SpanLog, TraceContext } from './types';

export class SpanBuilder {
  private span: Span;
  
  constructor(span: Span) { this.span = span; }
  
  setTag(key: string, value: string): this { this.span.tags[key] = value; return this; }
  log(message: string, fields?: Record<string, unknown>): this {
    this.span.logs.push({ timestamp: new Date(), message, fields });
    return this;
  }
  
  finish(): Span { this.span.endTime = new Date(); return this.span; }
  
  getContext(): TraceContext {
    return { traceId: this.span.traceId, spanId: this.span.spanId, sampled: true };
  }
}

export class SpanContext {
  constructor(private span: Span) {}
  
  getDuration(): number {
    if (!this.span.endTime) return Date.now() - this.span.startTime.getTime();
    return this.span.endTime.getTime() - this.span.startTime.getTime();
  }
  
  isFinished(): boolean { return !!this.span.endTime; }
  getSpan(): Span { return this.span; }
}