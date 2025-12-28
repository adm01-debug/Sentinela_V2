import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useWebSocket } from '../useWebSocket';

describe('useWebSocket', () => {
  it('works', () => {
    const { result } = renderHook(() => useWebSocket());
    expect(result.current).toBeDefined();
  });
});