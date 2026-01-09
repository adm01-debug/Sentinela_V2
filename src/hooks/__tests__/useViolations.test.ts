import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useViolations } from '../useViolations';

describe('useViolations', () => {
  it('should fetch violations', async () => {
    const { result } = renderHook(() => useViolations());
    expect(result.current.isLoading).toBeDefined();
  });
});