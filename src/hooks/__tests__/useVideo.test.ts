import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVideo } from '../useVideo';

describe('useVideo', () => {
  it('should return video controls', () => {
    const { result } = renderHook(() => useVideo());
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.play).toBe('function');
    expect(typeof result.current.pause).toBe('function');
  });
});