import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTags } from '../useTags';

describe('useTags', () => {
  it('should manage tags', () => {
    const { result } = renderHook(() => useTags());
    expect(result.current.tags).toBeDefined();
    act(() => { result.current.add('new-tag'); });
  });
});