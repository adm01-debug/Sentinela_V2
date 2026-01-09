import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMemoizedCallback } from '../useMemoizedCallback';
describe('useMemoizedCallback', () => { it('should memoize callback', () => { const fn = vi.fn(); const { result } = renderHook(() => useMemoizedCallback(fn, [])); expect(typeof result.current).toBe('function'); }); });