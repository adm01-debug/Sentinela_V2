import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSpeechRecognition } from '../useSpeechRecognition';

describe('useSpeechRecognition', () => {
  it('should check support', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBeDefined();
  });
});