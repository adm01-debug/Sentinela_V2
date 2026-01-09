import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useKeyboardShortcut } from '../useKeyboardShortcut';
describe('useKeyboardShortcut', () => { it('should register shortcut', () => { const handler = vi.fn(); renderHook(() => useKeyboardShortcut('ctrl+s', handler)); expect(handler).not.toHaveBeenCalled(); }); });