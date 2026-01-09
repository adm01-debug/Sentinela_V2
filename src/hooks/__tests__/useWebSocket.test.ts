import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useWebSocket } from '../useWebSocket';
describe('useWebSocket', () => { it('should manage websocket', () => { const { result } = renderHook(() => useWebSocket('wss://test.com')); expect(result.current.readyState).toBeDefined(); }); });