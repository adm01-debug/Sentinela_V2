import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePullToRefresh } from '../usePullToRefresh';
describe('usePullToRefresh', () => { it('should handle pull to refresh', () => { const onRefresh = vi.fn(); const { result } = renderHook(() => usePullToRefresh(onRefresh)); expect(result.current).toBeDefined(); }); });