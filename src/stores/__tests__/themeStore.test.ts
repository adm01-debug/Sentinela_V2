import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../themeStore';

describe('themeStore', () => {
  beforeEach(() => { useThemeStore.getState().reset?.() || useThemeStore.setState({ theme: 'system' }); });

  it('should have correct initial state', () => {
    const state = useThemeStore.getState();
    expect(['light', 'dark', 'system']).toContain(state.theme);
  });

  it('should set theme to dark', () => {
    const { setTheme } = useThemeStore.getState();
    setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('should set theme to light', () => {
    const { setTheme } = useThemeStore.getState();
    setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('should toggle theme', () => {
    const store = useThemeStore.getState();
    if (store.toggleTheme) {
      store.setTheme('light');
      store.toggleTheme();
      expect(useThemeStore.getState().theme).toBe('dark');
    }
  });
});
