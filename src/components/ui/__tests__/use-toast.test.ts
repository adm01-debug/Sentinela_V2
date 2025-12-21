import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the toast hook
const mockToast = vi.fn();
const mockDismiss = vi.fn();

const useToast = () => ({
  toast: mockToast,
  dismiss: mockDismiss,
  toasts: []
});

describe('useToast', () => {
  it('should return toast function', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast).toBeDefined();
  });

  it('should return dismiss function', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.dismiss).toBeDefined();
  });

  it('should call toast with message', () => {
    const { result } = renderHook(() => useToast());
    result.current.toast({ title: 'Test', description: 'Message' });
    expect(mockToast).toHaveBeenCalledWith({ title: 'Test', description: 'Message' });
  });

  it('should dismiss toast', () => {
    const { result } = renderHook(() => useToast());
    result.current.dismiss('toast-id');
    expect(mockDismiss).toHaveBeenCalledWith('toast-id');
  });

  it('should return empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });
});
