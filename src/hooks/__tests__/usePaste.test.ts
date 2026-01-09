import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePaste } from '../usePaste';

describe('usePaste', () => {
  it('should handle paste', () => {
    const onPaste = vi.fn();
    renderHook(() => usePaste(onPaste));
    document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: new DataTransfer() }));
  });
});