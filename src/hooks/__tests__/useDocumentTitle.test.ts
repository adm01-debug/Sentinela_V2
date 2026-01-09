import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDocumentTitle } from '../useDocumentTitle';

describe('useDocumentTitle', () => {
  const originalTitle = document.title;
  beforeEach(() => { document.title = originalTitle; });

  it('should set document title', () => {
    renderHook(() => useDocumentTitle('New Title'));
    expect(document.title).toBe('New Title');
  });

  it('should restore title on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('New Title'));
    unmount();
    expect(document.title).toBe(originalTitle);
  });
});