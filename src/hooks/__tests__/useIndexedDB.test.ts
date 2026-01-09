import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIndexedDB } from '../useIndexedDB';
describe('useIndexedDB', () => { it('should manage indexedDB', () => { const { result } = renderHook(() => useIndexedDB('db', 'store')); expect(result.current).toBeDefined(); }); });