import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useA11y } from '../useA11y';
describe('useA11y', () => { it('should return a11y helpers', () => { const { result } = renderHook(() => useA11y()); expect(result.current).toBeDefined(); }); });