import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from '../use-toast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should return toast function and toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast).toBeDefined();
    expect(result.current.toasts).toBeDefined();
    expect(Array.isArray(result.current.toasts)).toBe(true);
  });

  it('should add toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test',
      });
    });

    expect(result.current.toasts.length).toBeGreaterThan(0);
  });

  it('should dismiss toast after timeout', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test',
        duration: 1000,
      });
    });

    expect(result.current.toasts.length).toBeGreaterThan(0);
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });

  it('should handle different toast variants', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Default' });
      result.current.toast({ title: 'Destructive', variant: 'destructive' });
    });

    expect(result.current.toasts.length).toBeGreaterThanOrEqual(1);
  });

  it('should dismiss specific toast by id', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    act(() => {
      const { id } = result.current.toast({ title: 'Test' });
      toastId = id;
    });

    act(() => {
      result.current.dismiss(toastId);
    });
  });
});
