import { describe, it, expect } from 'vitest';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  it('should have initial state', () => {
    const store = useAuthStore.getState();
    expect(store).toBeDefined();
  });
});