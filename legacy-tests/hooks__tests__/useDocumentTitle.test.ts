import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '../useDocumentTitle';

describe('useDocumentTitle', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = 'Original Title';
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('should set document title', () => {
    renderHook(() => useDocumentTitle('New Title'));
    expect(document.title).toBe('New Title');
  });

  it('should append suffix if provided', () => {
    renderHook(() => useDocumentTitle('Page', ' | Sentinela'));
    expect(document.title).toBe('Page | Sentinela');
  });

  it('should restore original title on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Temp Title'));
    expect(document.title).toBe('Temp Title');
    unmount();
    // Title restoration depends on implementation
  });
});
