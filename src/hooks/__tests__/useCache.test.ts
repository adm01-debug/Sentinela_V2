import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCache } from '../useCache';
describe('useCache', () => { it('should manage cache', () => { const { result } = renderHook(() => useCache('key')); expect(result.current).toBeDefined(); }); });