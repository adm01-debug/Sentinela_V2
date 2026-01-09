import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScrollIntoView } from '../useScrollIntoView';

describe('useScrollIntoView', () => {
  it('should scroll element into view', () => {
    const element = document.createElement('div');
    element.scrollIntoView = vi.fn();
    const ref = { current: element };
    const { result } = renderHook(() => useScrollIntoView(ref));
    result.current.scrollIntoView();
    expect(element.scrollIntoView).toHaveBeenCalled();
  });
});