import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePushNotifications } from '../usePushNotifications';
describe('usePushNotifications', () => { it('should manage push notifications', () => { const { result } = renderHook(() => usePushNotifications()); expect(result.current).toBeDefined(); }); });