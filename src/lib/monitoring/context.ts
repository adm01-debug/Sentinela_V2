import { context, propagation } from '@opentelemetry/api';

export function extractContext(headers: Record<string, string>): any {
  return propagation.extract(context.active(), headers);
}

export function injectContext(headers: Record<string, string>): void {
  propagation.inject(context.active(), headers);
}
