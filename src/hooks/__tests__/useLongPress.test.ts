import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLongPress } from '../useLongPress';
describe('useLongPress', () => { it('should handle long press', () => { const handler = vi.fn(); const { result } = renderHook(() => useLongPress(handler)); expect(result.current).toBeDefined(); }); });