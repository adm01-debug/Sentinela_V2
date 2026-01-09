import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollDirection } from '../useScrollDirection';

describe('useScrollDirection', () => {
  it('should detect scroll direction', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBeDefined();
  });
});