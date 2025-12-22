import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useWindowFocus } from '../useWindowFocus';

describe('useWindowFocus', () => {
  it('works', () => {
    const { result } = renderHook(() => useWindowFocus());
    expect(result.current).toBeDefined();
  });
});