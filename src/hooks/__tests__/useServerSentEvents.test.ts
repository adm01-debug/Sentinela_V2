import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useServerSentEvents } from '../useServerSentEvents';
describe('useServerSentEvents', () => { it('should manage SSE', () => { const { result } = renderHook(() => useServerSentEvents('http://test.com')); expect(result.current).toBeDefined(); }); });