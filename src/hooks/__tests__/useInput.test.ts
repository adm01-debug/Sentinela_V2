import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useInput } from '../useInput';

describe('useInput', () => {
  it('should initialize with value', () => {
    const { result } = renderHook(() => useInput('initial'));
    expect(result.current.value).toBe('initial');
  });

  it('should handle change', () => {
    const { result } = renderHook(() => useInput(''));
    act(() => { result.current.onChange({ target: { value: 'new' } }); });
    expect(result.current.value).toBe('new');
  });

  it('should reset', () => {
    const { result } = renderHook(() => useInput('initial'));
    act(() => { result.current.onChange({ target: { value: 'changed' } }); });
    act(() => { result.current.reset(); });
    expect(result.current.value).toBe('initial');
  });
});