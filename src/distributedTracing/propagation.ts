import { TraceContext } from './types';

export class TraceContextPropagator {
  inject(context: TraceContext, carrier: Record<string, string>): void {
    carrier['x-trace-id'] = context.traceId;
    carrier['x-span-id'] = context.spanId;
    carrier['x-sampled'] = context.sampled ? '1' : '0';
  }
  
  extract(carrier: Record<string, string>): TraceContext | null {
    const traceId = carrier['x-trace-id'];
    const spanId = carrier['x-span-id'];
    if (!traceId || !spanId) return null;
    return { traceId, spanId, sampled: carrier['x-sampled'] === '1' };
  }
}

export class W3CTraceContext {
  static toHeader(context: TraceContext): string {
    return '00-' + context.traceId + '-' + context.spanId + '-' + (context.sampled ? '01' : '00');
  }
  
  static fromHeader(header: string): TraceContext | null {
    const parts = header.split('-');
    if (parts.length !== 4) return null;
    return { traceId: parts[1], spanId: parts[2], sampled: parts[3] === '01' };
  }
}