import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useModal } from '../useModal';

describe('useModal', () => {
  it('works', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current).toBeDefined();
  });
});