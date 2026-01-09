import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMicrophone } from '../useMicrophone';

describe('useMicrophone', () => {
  it('should request microphone access', () => {
    navigator.mediaDevices = { getUserMedia: vi.fn().mockResolvedValue({}) } as any;
    const { result } = renderHook(() => useMicrophone());
    expect(result.current.isSupported).toBeDefined();
  });
});