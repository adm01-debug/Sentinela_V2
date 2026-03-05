// OpenTelemetry stub - browser-side replacement
const trace = {
  getTracer: (_name: string) => ({
    startSpan: (name: string) => ({ recordException: () => {}, end: () => {}, setStatus: () => {}, setAttributes: () => {} }),
    startActiveSpan: async (_name: string, fn: (span: any) => Promise<any>) => {
      const span = { setStatus: () => {}, end: () => {}, setAttributes: () => {} };
      return fn(span);
    },
  }),
  getActiveSpan: () => null,
};

export function createSpan(name: string) {
  const tracer = trace.getTracer('sentinela');
  return tracer.startSpan(name);
}

export function endSpan(span: any, error?: Error): void {
  if (error) span.recordException(error);
  span.end();
}
