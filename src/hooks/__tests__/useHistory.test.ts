import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHistory } from '../useHistory';

describe('useHistory', () => {
  it('should track history', () => {
    const { result } = renderHook(() => useHistory('entity-id'));
    expect(result.current.history).toBeDefined();
  });
});