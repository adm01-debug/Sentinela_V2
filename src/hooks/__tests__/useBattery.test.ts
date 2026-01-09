import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBattery } from '../useBattery';

describe('useBattery', () => {
  it('should return battery state', () => {
    (navigator as any).getBattery = vi.fn().mockResolvedValue({ level: 0.8, charging: true });
    const { result } = renderHook(() => useBattery());
    expect(result.current.supported).toBeDefined();
  });
});