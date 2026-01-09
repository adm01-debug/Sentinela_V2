import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDownload } from '../useDownload';

describe('useDownload', () => {
  it('should download file', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:url');
    global.URL.createObjectURL = createObjectURL;
    const { result } = renderHook(() => useDownload());
    act(() => { result.current.download(new Blob(['test']), 'test.txt'); });
  });
});