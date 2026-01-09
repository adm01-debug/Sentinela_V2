import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useServiceWorker } from '../useServiceWorker';
describe('useServiceWorker', () => { it('should manage service worker', () => { const { result } = renderHook(() => useServiceWorker()); expect(result.current).toBeDefined(); }); });