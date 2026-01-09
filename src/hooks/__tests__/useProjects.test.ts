import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useProjects } from '../useProjects';

describe('useProjects', () => {
  it('should manage projects', () => {
    const { result } = renderHook(() => useProjects());
    expect(result.current.projects).toBeDefined();
    expect(typeof result.current.create).toBe('function');
  });
});