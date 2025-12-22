import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEventSource } from '../useEventSource';

describe('useEventSource', () => {
  it('works', () => {
    const { result } = renderHook(() => useEventSource());
    expect(result.current).toBeDefined();
  });
});