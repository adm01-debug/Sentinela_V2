import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVisibility } from '../useVisibility';

describe('useVisibility', () => {
  it('should track page visibility', () => {
    const { result } = renderHook(() => useVisibility());
    expect(result.current.isVisible).toBeDefined();
  });
});