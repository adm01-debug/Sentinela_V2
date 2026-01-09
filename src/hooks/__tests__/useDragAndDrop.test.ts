import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDragAndDrop } from '../useDragAndDrop';

describe('useDragAndDrop', () => {
  it('should track dragging state', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useDragAndDrop(ref));
    expect(result.current.isDragging).toBe(false);
  });
});