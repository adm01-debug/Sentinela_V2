import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVoiceControl } from '../useVoiceControl';
describe('useVoiceControl', () => { it('should provide voice control', () => { const { result } = renderHook(() => useVoiceControl()); expect(result.current).toBeDefined(); }); });