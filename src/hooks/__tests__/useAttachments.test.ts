import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAttachments } from '../useAttachments';

describe('useAttachments', () => {
  it('should manage attachments', () => {
    const { result } = renderHook(() => useAttachments());
    expect(result.current.attachments).toBeDefined();
    expect(typeof result.current.upload).toBe('function');
  });
});