import { describe, it, expect } from 'vitest';
import { usePolicyStore } from '../policyStore';

describe('policyStore', () => {
  it('should have initial state', () => {
    const store = usePolicyStore.getState();
    expect(store).toBeDefined();
  });
});