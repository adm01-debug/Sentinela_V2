import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCountdown } from '../useCountdown';
describe('useCountdown', () => { beforeEach(() => vi.useFakeTimers()); afterEach(() => vi.useRealTimers()); it('should countdown', () => { const { result } = renderHook(() => useCountdown(10)); expect(result.current.remaining).toBe(10); }); });