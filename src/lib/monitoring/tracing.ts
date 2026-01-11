import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('sentinela');

export function startSpan(name: string, fn: () => Promise<any>): Promise<any> {
  return tracer.startActiveSpan(name, async (span) => {
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
