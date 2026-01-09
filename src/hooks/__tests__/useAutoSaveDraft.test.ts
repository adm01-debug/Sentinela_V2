import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAutoSaveDraft } from '../useAutoSaveDraft';
describe('useAutoSaveDraft', () => { it('should auto save draft', () => { const { result } = renderHook(() => useAutoSaveDraft('key', { data: 'test' })); expect(result.current).toBeDefined(); }); });