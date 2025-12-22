import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAccordion } from '../useAccordion';

describe('useAccordion', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useAccordion());
    expect(result.current).toBeDefined();
  });
});