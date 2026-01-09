import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useImagePreload } from '../useImagePreload';
describe('useImagePreload', () => { it('should preload images', () => { const { result } = renderHook(() => useImagePreload(['http://img.com/1.jpg'])); expect(result.current).toBeDefined(); }); });