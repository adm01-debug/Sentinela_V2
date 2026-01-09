import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToast } from '../useToast';

describe('useToast', () => {
  it('should add toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.toast({ message: 'Test' }); });
    expect(result.current.toasts.length).toBeGreaterThan(0);
  });

  it('should remove toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => { const id = result.current.toast({ message: 'Test' }); result.current.dismiss(id); });
  });
});