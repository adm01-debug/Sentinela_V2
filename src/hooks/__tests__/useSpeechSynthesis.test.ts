import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSpeechSynthesis } from '../useSpeechSynthesis';

describe('useSpeechSynthesis', () => {
  it('should speak text', () => {
    window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn(), getVoices: vi.fn().mockReturnValue([]) } as any;
    const { result } = renderHook(() => useSpeechSynthesis());
    act(() => { result.current.speak('Hello'); });
  });
});