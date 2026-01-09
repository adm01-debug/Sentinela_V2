import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSchema } from '../useSchema';

describe('useSchema', () => {
  it('should validate against schema', () => {
    const { result } = renderHook(() => useSchema({ type: 'object' }));
    expect(typeof result.current.validate).toBe('function');
  });
});