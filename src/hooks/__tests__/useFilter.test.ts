import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFilter } from '../useFilter';

describe('useFilter', () => {
  it('should filter items', () => {
    const items = [{ name: 'a' }, { name: 'b' }];
    const { result } = renderHook(() => useFilter(items, item => item.name === 'a'));
    expect(result.current.length).toBe(1);
    expect(result.current[0].name).toBe('a');
  });
});