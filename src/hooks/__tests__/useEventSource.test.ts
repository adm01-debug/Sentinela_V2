import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEventSource } from '../useEventSource';
describe('useEventSource', () => { it('should manage event source', () => { const { result } = renderHook(() => useEventSource('http://test')); expect(result.current).toBeDefined(); }); });