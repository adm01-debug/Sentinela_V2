import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOnlineStatus } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  it('should return online status', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(typeof result.current).toBe('boolean');
  });
});