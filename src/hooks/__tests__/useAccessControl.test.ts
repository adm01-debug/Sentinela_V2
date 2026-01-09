import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAccessControl } from '../useAccessControl';

describe('useAccessControl', () => {
  it('should check access', () => {
    const { result } = renderHook(() => useAccessControl());
    expect(typeof result.current.can).toBe('function');
    expect(typeof result.current.cannot).toBe('function');
  });
});