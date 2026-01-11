import { trace } from '@opentelemetry/api';

export function createSpan(name: string) {
  const tracer = trace.getTracer('sentinela');
  return tracer.startSpan(name);
}

export function endSpan(span: any, error?: Error): void {
  if (error) span.recordException(error);
  span.end();
}
