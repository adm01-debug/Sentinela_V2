import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useNotifications } from '../useNotifications';

describe('useNotifications', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current).toBeDefined();
  });
});