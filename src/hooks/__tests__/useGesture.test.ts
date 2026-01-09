import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGesture } from '../useGesture';

describe('useGesture', () => {
  it('should handle gestures', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useGesture(ref));
    expect(result.current.state).toBeDefined();
  });
});