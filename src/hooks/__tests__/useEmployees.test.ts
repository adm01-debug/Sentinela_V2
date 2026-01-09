import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEmployees } from '../useEmployees';
describe('useEmployees', () => { it('should fetch employees', () => { const { result } = renderHook(() => useEmployees()); expect(result.current.employees).toBeDefined(); }); });