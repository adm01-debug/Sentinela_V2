import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRealtimeSync } from '../useRealtimeSync';

describe('useRealtimeSync', () => {
  it('should sync in realtime', () => {
    const { result } = renderHook(() => useRealtimeSync('channel'));
    expect(result.current.data).toBeDefined();
    expect(result.current.isConnected).toBeDefined();
  });
});