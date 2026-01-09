import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useImmer } from '../useImmer';

describe('useImmer', () => {
  it('should update state immutably', () => {
    const { result } = renderHook(() => useImmer({ count: 0 }));
    act(() => { result.current[1](draft => { draft.count = 5; }); });
    expect(result.current[0].count).toBe(5);
  });
});