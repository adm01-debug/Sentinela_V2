import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEventListener } from '../useEventListener';

describe('useEventListener', () => {
  it('works', () => {
    const { result } = renderHook(() => useEventListener());
    expect(result.current).toBeDefined();
  });
});