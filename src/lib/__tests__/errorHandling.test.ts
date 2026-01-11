import { describe, it, expect } from 'vitest';
import { handleError, isNetworkError, createError } from '../error-handling/handler';
describe('errorHandling', () => {
  it('handles Error', () => { const result = handleError(new Error('Test')); expect(result.message).toBe('Test'); });
  it('handles unknown', () => { const result = handleError('string error'); expect(result.code).toBe('UNKNOWN_ERROR'); });
  it('creates error', () => { const err = createError('TEST', 'Test message'); expect(err.code).toBe('TEST'); });
});