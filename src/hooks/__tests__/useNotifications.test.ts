import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNotifications } from '../useNotifications';

describe('useNotifications', () => {
  it('should manage notifications', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toBeDefined();
    act(() => { result.current.add({ message: 'Test' }); });
  });
});