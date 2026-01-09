import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSettings } from '../useSettings';

describe('useSettings', () => {
  it('should manage settings', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toBeDefined();
    act(() => { result.current.update({ theme: 'dark' }); });
  });
});