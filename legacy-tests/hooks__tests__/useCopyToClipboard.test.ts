import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCopyToClipboard } from '../useCopyToClipboard';

describe('useCopyToClipboard', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current).toBeDefined();
  });
});