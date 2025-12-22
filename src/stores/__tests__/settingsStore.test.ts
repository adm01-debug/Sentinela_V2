import { describe, it, expect } from 'vitest';
import { useSettingsStore } from '../settingsStore';

describe('settingsStore', () => {
  it('should have initial state', () => {
    const store = useSettingsStore.getState();
    expect(store).toBeDefined();
  });
});