import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEmployees } from '../useEmployees';

describe('useEmployees', () => {
  it('should fetch employees', async () => {
    const { result } = renderHook(() => useEmployees());
    expect(result.current.isLoading).toBeDefined();
    await waitFor(() => expect(result.current.data).toBeDefined());
  });
});