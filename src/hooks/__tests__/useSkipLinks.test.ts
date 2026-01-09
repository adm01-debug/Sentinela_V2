import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSkipLinks } from '../useSkipLinks';
describe('useSkipLinks', () => { it('should provide skip link helpers', () => { const { result } = renderHook(() => useSkipLinks()); expect(result.current).toBeDefined(); }); });