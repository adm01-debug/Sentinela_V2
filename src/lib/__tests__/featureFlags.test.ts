import { describe, it, expect, beforeEach } from 'vitest';
import { isFeatureEnabled, setFeatureFlag, getFeatureFlags } from '../feature-flags';
describe('featureFlags', () => {
  it('checks if feature is enabled', () => { expect(typeof isFeatureEnabled('darkMode')).toBe('boolean'); });
  it('sets feature flag', () => { setFeatureFlag('advancedReports', true); expect(isFeatureEnabled('advancedReports')).toBe(true); });
  it('gets all flags', () => { const flags = getFeatureFlags(); expect(flags).toHaveProperty('darkMode'); });
});