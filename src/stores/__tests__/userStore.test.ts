import { describe, it, expect } from 'vitest';
import { useUserStore } from '../userStore';

describe('userStore', () => {
  it('should have initial state', () => {
    const store = useUserStore.getState();
    expect(store).toBeDefined();
  });
});