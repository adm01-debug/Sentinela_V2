import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAudio } from '../useAudio';

describe('useAudio', () => {
  it('should create audio element', () => {
    const { result } = renderHook(() => useAudio('/audio.mp3'));
    expect(result.current.playing).toBe(false);
  });

  it('should play audio', () => {
    const { result } = renderHook(() => useAudio('/audio.mp3'));
    expect(typeof result.current.play).toBe('function');
  });
});