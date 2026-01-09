import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRealTimeMonitor } from '../useRealTimeMonitor';

describe('useRealTimeMonitor', () => {
  it('should monitor in realtime', () => {
    const { result } = renderHook(() => useRealTimeMonitor());
    expect(result.current.status).toBeDefined();
    expect(result.current.activeUsers).toBeDefined();
  });
});