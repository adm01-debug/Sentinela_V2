import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBroadcastChannel } from '../useBroadcastChannel';
describe('useBroadcastChannel', () => { it('should create channel', () => { const { result } = renderHook(() => useBroadcastChannel('test')); expect(result.current).toBeDefined(); }); });