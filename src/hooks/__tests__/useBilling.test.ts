import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBilling } from '../useBilling';

describe('useBilling', () => {
  it('should manage billing', () => {
    const { result } = renderHook(() => useBilling());
    expect(result.current.subscription).toBeDefined();
    expect(result.current.invoices).toBeDefined();
  });
});