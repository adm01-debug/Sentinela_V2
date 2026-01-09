import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAlerts } from '../useAlerts';

describe('useAlerts', () => {
  it('should manage alerts', () => {
    const { result } = renderHook(() => useAlerts());
    expect(result.current.alerts).toBeDefined();
    act(() => { result.current.add({ type: 'warning', message: 'Test' }); });
  });
});