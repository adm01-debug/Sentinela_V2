import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useComments } from '../useComments';

describe('useComments', () => {
  it('should manage comments', () => {
    const { result } = renderHook(() => useComments('entity-id'));
    expect(result.current.comments).toBeDefined();
    act(() => { result.current.add({ text: 'Test comment' }); });
  });
});