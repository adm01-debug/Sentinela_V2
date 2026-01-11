import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../settingsStore';
describe('settingsStore', () => {
  it('updates settings', () => { useSettingsStore.getState().updateSettings('general', { companyName: 'Test Co' }); expect(useSettingsStore.getState().settings.general.companyName).toBe('Test Co'); });
});