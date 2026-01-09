import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOffline } from '../useOffline';

describe('useOffline', () => {
  it('should detect offline state', () => {
    const { result } = renderHook(() => useOffline());
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current.isOffline).toBe(true);
  });
});