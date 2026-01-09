import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOfflineFirst } from '../useOfflineFirst';
describe('useOfflineFirst', () => { it('should provide offline first', () => { const { result } = renderHook(() => useOfflineFirst('key')); expect(result.current).toBeDefined(); }); });