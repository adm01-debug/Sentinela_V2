import { describe, it, expect } from 'vitest';
import { useFilterStore } from '../filterStore';

describe('filterStore', () => {
  it('should have initial state', () => {
    const store = useFilterStore.getState();
    expect(store).toBeDefined();
  });
});