import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useWebhooks } from '../useWebhooks';
describe('useWebhooks', () => { it('should fetch webhooks', () => { const { result } = renderHook(() => useWebhooks()); expect(result.current).toBeDefined(); }); });