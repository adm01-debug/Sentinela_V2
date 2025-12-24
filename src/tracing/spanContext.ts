export interface SpanContext { traceId: string; spanId: string; traceFlags: number; }
export class SpanContextManager {
  private current: SpanContext | null = null;
  set(context: SpanContext): void { this.current = context; }
  get(): SpanContext | null { return this.current; }
  clear(): void { this.current = null; }
  createChild(): SpanContext { return { traceId: this.current?.traceId || crypto.randomUUID(), spanId: crypto.randomUUID(), traceFlags: 1 }; }
  toHeader(): string { if (!this.current) return ''; return '00-' + this.current.traceId + '-' + this.current.spanId + '-0' + this.current.traceFlags; }
  fromHeader(header: string): SpanContext | null { const parts = header.split('-'); if (parts.length !== 4) return null; return { traceId: parts[1], spanId: parts[2], traceFlags: parseInt(parts[3], 16) }; }
}
export const spanContextManager = new SpanContextManager();
