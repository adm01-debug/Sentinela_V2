import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePinchToZoom } from '../usePinchToZoom';
describe('usePinchToZoom', () => { it('should handle pinch zoom', () => { const ref = { current: document.createElement('div') }; const { result } = renderHook(() => usePinchToZoom(ref)); expect(result.current).toBeDefined(); }); });