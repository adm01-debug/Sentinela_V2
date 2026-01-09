import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLocale } from '../useLocale';

describe('useLocale', () => {
  it('should return current locale', () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current.locale).toBeDefined();
  });

  it('should change locale', () => {
    const { result } = renderHook(() => useLocale());
    act(() => { result.current.setLocale('en-US'); });
    expect(result.current.locale).toBe('en-US');
  });
});