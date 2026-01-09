import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFileReader } from '../useFileReader';

describe('useFileReader', () => {
  it('should read file', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const { result } = renderHook(() => useFileReader());
    act(() => { result.current.readAsText(file); });
    await waitFor(() => expect(result.current.result).toBe('test'));
  });
});