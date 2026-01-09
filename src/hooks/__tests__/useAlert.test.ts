import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAlert } from '../useAlert';

describe('useAlert', () => {
  it('should show alert', () => {
    const { result } = renderHook(() => useAlert());
    act(() => { result.current.showAlert({ type: 'success', message: 'Done!' }); });
    expect(result.current.alert?.message).toBe('Done!');
  });

  it('should clear alert', () => {
    const { result } = renderHook(() => useAlert());
    act(() => { result.current.showAlert({ type: 'error', message: 'Err' }); });
    act(() => { result.current.clearAlert(); });
    expect(result.current.alert).toBeNull();
  });
});