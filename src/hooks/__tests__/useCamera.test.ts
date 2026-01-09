import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCamera } from '../useCamera';

describe('useCamera', () => {
  it('should request camera access', () => {
    navigator.mediaDevices = { getUserMedia: vi.fn().mockResolvedValue({}) } as any;
    const { result } = renderHook(() => useCamera());
    expect(result.current.isSupported).toBeDefined();
  });
});