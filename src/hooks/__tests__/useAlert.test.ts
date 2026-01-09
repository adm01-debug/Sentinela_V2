import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAlert } from '../useAlert';

describe('useAlert', () => {
  it('should show alert', () => {
    const { result } = renderHook(() => useAlert());
    act(() => { result.current.alert({ message: 'Info' }); });
    expect(result.current.isOpen).toBe(true);
  });
});