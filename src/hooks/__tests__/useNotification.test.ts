import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNotification } from '../useNotification';
describe('useNotification', () => { it('should manage notifications', () => { const { result } = renderHook(() => useNotification()); expect(result.current.permission).toBeDefined(); }); });