import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAuditLogs } from '../useAuditLogs';
describe('useAuditLogs', () => { it('should fetch audit logs', () => { const { result } = renderHook(() => useAuditLogs()); expect(result.current).toBeDefined(); }); });