import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRovingTabIndex } from '../useRovingTabIndex';
describe('useRovingTabIndex', () => { it('should manage roving tabindex', () => { const { result } = renderHook(() => useRovingTabIndex(3)); expect(result.current.activeIndex).toBe(0); }); });