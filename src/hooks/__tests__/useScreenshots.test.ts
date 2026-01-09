import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScreenshots } from '../useScreenshots';

describe('useScreenshots', () => {
  it('should manage screenshots', () => {
    const { result } = renderHook(() => useScreenshots());
    expect(result.current.screenshots).toBeDefined();
    expect(result.current.capture).toBeDefined();
  });
});