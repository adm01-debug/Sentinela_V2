// OpenTelemetry stub - browser-side replacement
const SpanStatusCode = { OK: 0, ERROR: 1 };
const trace = {
  getTracer: (_name: string) => ({
    startActiveSpan: async (name: string, fn: (span: any) => Promise<any>) => {
      const span = {
        setStatus: (_s: any) => {},
        end: () => {},
        setAttributes: (_a: any) => {},
        recordException: (_e: any) => {},
      };
      return fn(span);
    },
  }),
  getActiveSpan: () => null as any,
};

export function startSpan(name: string, fn: () => Promise<any>): Promise<any> {
  return trace.getTracer('sentinela').startActiveSpan(name, async (span: any) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

export function addSpanAttributes(attributes: Record<string, string>): void {
  const span = trace.getActiveSpan();
  span?.setAttributes(attributes);
}
