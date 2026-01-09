import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCookie } from '../useCookie';

describe('useCookie', () => {
  it('should get cookie value', () => {
    document.cookie = 'testCookie=testValue';
    const { result } = renderHook(() => useCookie('testCookie'));
    expect(result.current[0]).toBe('testValue');
  });

  it('should set cookie', () => {
    const { result } = renderHook(() => useCookie('newCookie'));
    act(() => { result.current[1]('newValue'); });
    expect(document.cookie).toContain('newCookie=newValue');
  });
});