import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useA11y } from '../useA11y';

describe('useA11y', () => {
  it('should return a11y utilities', () => {
    const { result } = renderHook(() => useA11y());

    expect(result.current).toBeDefined();
  });

  it('should provide announce function', () => {
    const { result } = renderHook(() => useA11y());

    expect(typeof result.current.announce).toBe('function');
  });

  it('should provide focusFirst function', () => {
    const { result } = renderHook(() => useA11y());

    expect(typeof result.current.focusFirst).toBe('function');
  });

  it('should provide trapFocus function', () => {
    const { result } = renderHook(() => useA11y());

    expect(typeof result.current.trapFocus).toBe('function');
  });

  it('should announce messages to screen readers', () => {
    const { result } = renderHook(() => useA11y());
    
    // Should not throw
    expect(() => result.current.announce('Test message')).not.toThrow();
  });

  it('should handle empty announce message', () => {
    const { result } = renderHook(() => useA11y());
    
    expect(() => result.current.announce('')).not.toThrow();
  });
});
