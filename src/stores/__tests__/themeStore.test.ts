import { describe, it, expect } from 'vitest';
import { useThemeStore } from '../themeStore';

describe('themeStore', () => {
  it('should have initial state', () => {
    const store = useThemeStore.getState();
    expect(store).toBeDefined();
  });
});