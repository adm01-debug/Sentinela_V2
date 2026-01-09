import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePortal } from '../usePortal';
describe('usePortal', () => {
  it('should create portal element', () => {
    const { result } = renderHook(() => usePortal('test-portal'));
    expect(result.current).toBeDefined();
  });
});