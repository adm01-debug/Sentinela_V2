import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollLock } from '../useScrollLock';

describe('useScrollLock', () => {
  it('should lock scroll', () => {
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
  });
});