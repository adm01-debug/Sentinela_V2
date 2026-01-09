import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFocus } from '../useFocus';

describe('useFocus', () => {
  it('should return focus state', () => {
    const { result } = renderHook(() => useFocus());
    expect(result.current[1]).toBe(false);
  });
});