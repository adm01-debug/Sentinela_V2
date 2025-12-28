import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIdle } from '../useIdle';

describe('useIdle', () => {
  it('works', () => {
    const { result } = renderHook(() => useIdle());
    expect(result.current).toBeDefined();
  });
});