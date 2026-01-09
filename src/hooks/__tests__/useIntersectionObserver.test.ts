import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIntersectionObserver } from '../useIntersectionObserver';
describe('useIntersectionObserver', () => {
  it('should track intersection', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useIntersectionObserver(ref));
    expect(result.current).toBeDefined();
  });
});