export interface Trace { traceId: string; spans: Span[]; startTime: Date; endTime?: Date; }
export interface Span { spanId: string; traceId: string; parentId?: string; name: string; startTime: Date; endTime?: Date; tags: Record<string, string>; logs: SpanLog[]; }
export interface SpanLog { timestamp: Date; message: string; fields?: Record<string, unknown>; }
export interface TraceContext { traceId: string; spanId: string; sampled: boolean; }