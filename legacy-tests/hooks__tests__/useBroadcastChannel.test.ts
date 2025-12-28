import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBroadcastChannel } from '../useBroadcastChannel';

describe('useBroadcastChannel', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useBroadcastChannel());
    expect(result.current).toBeDefined();
  });
});