import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScript } from '../useScript';

describe('useScript', () => {
  it('should load script', async () => {
    const { result } = renderHook(() => useScript('https://example.com/script.js'));
    expect(result.current.loading).toBeDefined();
  });
});