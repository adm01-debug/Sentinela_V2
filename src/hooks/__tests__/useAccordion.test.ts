import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAccordion } from '../useAccordion';

describe('useAccordion', () => {
  it('should expand item', () => {
    const { result } = renderHook(() => useAccordion());
    act(() => { result.current.expand('item1'); });
    expect(result.current.isExpanded('item1')).toBe(true);
  });

  it('should collapse item', () => {
    const { result } = renderHook(() => useAccordion());
    act(() => { result.current.expand('item1'); result.current.collapse('item1'); });
    expect(result.current.isExpanded('item1')).toBe(false);
  });
});