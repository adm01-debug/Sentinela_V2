import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMessageTemplates } from '../useMessageTemplates';
describe('useMessageTemplates', () => { it('should fetch templates', () => { const { result } = renderHook(() => useMessageTemplates()); expect(result.current).toBeDefined(); }); });