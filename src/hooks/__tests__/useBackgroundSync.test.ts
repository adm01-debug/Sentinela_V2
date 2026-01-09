import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBackgroundSync } from '../useBackgroundSync';
describe('useBackgroundSync', () => { it('should manage background sync', () => { const { result } = renderHook(() => useBackgroundSync()); expect(result.current).toBeDefined(); }); });