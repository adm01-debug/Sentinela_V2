import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAnimation } from '../useAnimation';
describe('useAnimation', () => { it('should manage animation', () => { const { result } = renderHook(() => useAnimation()); expect(result.current).toBeDefined(); }); });