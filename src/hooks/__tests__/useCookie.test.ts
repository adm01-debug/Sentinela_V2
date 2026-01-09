import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCookie } from '../useCookie';

describe('useCookie', () => {
  it('should get cookie value', () => {
    document.cookie = 'test=value';
    const { result } = renderHook(() => useCookie('test'));
    expect(result.current.value).toBe('value');
  });

  it('should set cookie', () => {
    const { result } = renderHook(() => useCookie('newCookie'));
    act(() => { result.current.setCookie('newValue'); });
    expect(document.cookie).toContain('newCookie=newValue');
  });
});