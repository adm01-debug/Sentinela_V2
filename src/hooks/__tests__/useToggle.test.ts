import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle, useBoolean, useDisclosure } from '../useToggle';

describe('useToggle', () => {
  it('should initialize with default value false', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(false);
  });

  it('should set specific value', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[2](true);
    });

    expect(result.current[0]).toBe(true);
  });
});

describe('useBoolean', () => {
  it('should provide setTrue and setFalse', () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.setTrue();
    });
    expect(result.current.value).toBe(true);

    act(() => {
      result.current.setFalse();
    });
    expect(result.current.value).toBe(false);
  });
});

describe('useDisclosure', () => {
  it('should handle open/close', () => {
    const { result } = renderHook(() => useDisclosure(false));

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
  });
});
