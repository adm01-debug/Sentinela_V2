import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBlockNavigation } from '../useBlockNavigation';

describe('useBlockNavigation', () => {
  it('should block navigation when dirty', () => {
    const { result } = renderHook(() => useBlockNavigation(true));
    expect(result.current.isBlocking).toBe(true);
  });
});