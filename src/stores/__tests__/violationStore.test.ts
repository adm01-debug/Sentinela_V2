import { describe, it, expect } from 'vitest';
import { useViolationStore } from '../violationStore';

describe('violationStore', () => {
  it('should have initial state', () => {
    const store = useViolationStore.getState();
    expect(store).toBeDefined();
  });
});