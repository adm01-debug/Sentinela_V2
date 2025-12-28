import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useResize } from '../useResize';

describe('useResize', () => {
  it('works', () => {
    const { result } = renderHook(() => useResize());
    expect(result.current).toBeDefined();
  });
});