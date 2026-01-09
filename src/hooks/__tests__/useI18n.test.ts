import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useI18n } from '../useI18n';

describe('useI18n', () => {
  it('should return current locale', () => {
    const { result } = renderHook(() => useI18n());
    expect(result.current.locale).toBeDefined();
  });

  it('should translate key', () => {
    const { result } = renderHook(() => useI18n());
    expect(typeof result.current.t).toBe('function');
  });

  it('should change locale', () => {
    const { result } = renderHook(() => useI18n());
    act(() => { result.current.setLocale('pt-BR'); });
    expect(result.current.locale).toBe('pt-BR');
  });
});