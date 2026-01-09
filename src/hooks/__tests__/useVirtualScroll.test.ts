import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVirtualScroll } from '../useVirtualScroll';
describe('useVirtualScroll', () => { it('should virtualize scroll', () => { const { result } = renderHook(() => useVirtualScroll({ itemCount: 100, itemSize: 50 })); expect(result.current).toBeDefined(); }); });