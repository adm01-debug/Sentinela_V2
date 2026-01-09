import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBattery } from '../useBattery';

describe('useBattery', () => {
  it('should get battery status', async () => {
    const mockBattery = { level: 0.8, charging: true, addEventListener: vi.fn() };
    (navigator as any).getBattery = vi.fn().mockResolvedValue(mockBattery);
    const { result } = renderHook(() => useBattery());
    await waitFor(() => expect(result.current.level).toBe(0.8));
  });
});