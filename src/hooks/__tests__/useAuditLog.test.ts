import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAuditLog } from '../useAuditLog';

describe('useAuditLog', () => {
  it('should fetch audit logs', () => {
    const { result } = renderHook(() => useAuditLog());
    expect(result.current.logs).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
  });
});