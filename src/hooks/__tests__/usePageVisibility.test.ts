import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePageVisibility } from '../usePageVisibility';

describe('usePageVisibility', () => {
  it('should return visibility state', () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(!document.hidden);
  });
});