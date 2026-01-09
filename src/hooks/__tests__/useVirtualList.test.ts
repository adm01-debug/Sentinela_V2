import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVirtualList } from '../useVirtualList';
describe('useVirtualList', () => { it('should virtualize list', () => { const { result } = renderHook(() => useVirtualList({ items: [1,2,3], itemHeight: 50 })); expect(result.current).toBeDefined(); }); });