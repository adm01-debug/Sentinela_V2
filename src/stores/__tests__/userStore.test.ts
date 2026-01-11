import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../userStore';
describe('userStore', () => {
  beforeEach(() => { useUserStore.setState({ preferences: { theme: 'system', language: 'en', notifications: true, timezone: 'UTC' }, recentSearches: [], favorites: [] }); });
  it('sets preference', () => { useUserStore.getState().setPreference('theme', 'dark'); expect(useUserStore.getState().preferences.theme).toBe('dark'); });
  it('adds recent search', () => { useUserStore.getState().addRecentSearch('test'); expect(useUserStore.getState().recentSearches).toContain('test'); });
});