import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePageLeave } from '../usePageLeave';

describe('usePageLeave', () => {
  it('should detect page leave', () => {
    const onLeave = vi.fn();
    renderHook(() => usePageLeave(onLeave));
    document.dispatchEvent(new MouseEvent('mouseleave'));
  });
});