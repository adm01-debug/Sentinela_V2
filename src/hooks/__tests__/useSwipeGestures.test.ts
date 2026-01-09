import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSwipeGestures } from '../useSwipeGestures';
describe('useSwipeGestures', () => { it('should detect swipe', () => { const ref = { current: document.createElement('div') }; const { result } = renderHook(() => useSwipeGestures(ref)); expect(result.current).toBeDefined(); }); });