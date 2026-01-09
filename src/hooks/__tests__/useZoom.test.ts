import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useZoom } from '../useZoom';

describe('useZoom', () => {
  it('should return zoom level', () => {
    const { result } = renderHook(() => useZoom());
    expect(result.current.zoom).toBe(1);
  });

  it('should zoom in', () => {
    const { result } = renderHook(() => useZoom());
    act(() => { result.current.zoomIn(); });
    expect(result.current.zoom).toBeGreaterThan(1);
  });

  it('should zoom out', () => {
    const { result } = renderHook(() => useZoom(2));
    act(() => { result.current.zoomOut(); });
    expect(result.current.zoom).toBeLessThan(2);
  });
});