import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCurrencyFormat } from '../useCurrencyFormat';

describe('useCurrencyFormat', () => {
  it('should format currency', () => {
    const { result } = renderHook(() => useCurrencyFormat(100, 'BRL'));
    expect(result.current).toContain('R$');
  });
});