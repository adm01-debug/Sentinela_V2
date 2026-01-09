import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useWhyDidYouUpdate } from '../useWhyDidYouUpdate';

describe('useWhyDidYouUpdate', () => {
  it('should log prop changes', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { rerender } = renderHook(({ props }) => useWhyDidYouUpdate('Test', props), { initialProps: { props: { a: 1 } } });
    rerender({ props: { a: 2 } });
    spy.mockRestore();
  });
});