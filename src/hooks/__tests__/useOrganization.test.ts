import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOrganization } from '../useOrganization';

describe('useOrganization', () => {
  it('should return organization data', () => {
    const { result } = renderHook(() => useOrganization());
    expect(result.current.organization).toBeDefined();
  });
});