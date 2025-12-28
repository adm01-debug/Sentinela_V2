import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useKeyPress } from '../useKeyPress';

describe('useKeyPress', () => {
  it('works', () => {
    const { result } = renderHook(() => useKeyPress());
    expect(result.current).toBeDefined();
  });
});