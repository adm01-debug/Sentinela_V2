import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useActivities } from '../useActivities';

describe('useActivities', () => {
  it('should fetch activities', () => {
    const { result } = renderHook(() => useActivities());
    expect(result.current.activities).toBeDefined();
  });
});