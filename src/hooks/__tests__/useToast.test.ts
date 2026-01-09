import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToast } from '../useToast';

describe('useToast', () => {
  it('should add toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.toast({ message: 'Hello' }); });
    expect(result.current.toasts.length).toBe(1);
  });

  it('should remove toast', () => {
    const { result } = renderHook(() => useToast());
    let id: string;
    act(() => { id = result.current.toast({ message: 'Hello' }); });
    act(() => { result.current.dismiss(id); });
    expect(result.current.toasts.length).toBe(0);
  });
});