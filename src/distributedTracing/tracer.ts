import { Trace, Span, TraceContext } from './types';
import { v4 as uuidv4 } from 'uuid';

export class Tracer {
  private traces: Map<string, Trace> = new Map();
  private activeSpans: Map<string, Span> = new Map();
  
  startTrace(name: string): Span {
    const traceId = uuidv4();
    const span = this.createSpan(traceId, name);
    this.traces.set(traceId, { traceId, spans: [span], startTime: new Date() });
    return span;
  }
  
  startSpan(name: string, parentContext?: TraceContext): Span {
    const traceId = parentContext?.traceId ?? uuidv4();
    const span = this.createSpan(traceId, name, parentContext?.spanId);
    
    const trace = this.traces.get(traceId);
    if (trace) trace.spans.push(span);
    else this.traces.set(traceId, { traceId, spans: [span], startTime: new Date() });
    
    return span;
  }
  
  private createSpan(traceId: string, name: string, parentId?: string): Span {
    const span: Span = { spanId: uuidv4(), traceId, parentId, name, startTime: new Date(), tags: {}, logs: [] };
    this.activeSpans.set(span.spanId, span);
    return span;
  }
  
  finishSpan(spanId: string): void {
    const span = this.activeSpans.get(spanId);
    if (span) { span.endTime = new Date(); this.activeSpans.delete(spanId); }
  }
  
  getTrace(traceId: string): Trace | undefined { return this.traces.get(traceId); }
}