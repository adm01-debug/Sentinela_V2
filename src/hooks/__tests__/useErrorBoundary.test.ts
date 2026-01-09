import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useErrorBoundary } from '../useErrorBoundary';

describe('useErrorBoundary', () => {
  it('should return error state', () => {
    const { result } = renderHook(() => useErrorBoundary());
    expect(result.current.error).toBeNull();
    expect(typeof result.current.resetError).toBe('function');
  });
});