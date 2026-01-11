import { describe, it, expect, vi } from 'vitest';
vi.mock('@opentelemetry/api', () => ({ trace: { getTracer: () => ({ startActiveSpan: vi.fn() }) }, SpanStatusCode: { OK: 0, ERROR: 1 } }));
import * as tracing from '../tracing';

describe('Tracing', () => {
  it('should export startSpan', () => { expect(tracing.startSpan).toBeDefined(); });
});
