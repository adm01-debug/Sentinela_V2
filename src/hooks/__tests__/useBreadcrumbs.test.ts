import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBreadcrumbs } from '../useBreadcrumbs';

describe('useBreadcrumbs', () => {
  it('should generate breadcrumbs', () => {
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current.items).toBeDefined();
  });
});