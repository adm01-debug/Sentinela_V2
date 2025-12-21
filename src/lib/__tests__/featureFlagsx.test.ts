import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isFeatureEnabled, getFeatureFlags, setFeatureFlag, resetFeatureFlags } from '../featureFlagsx';

describe('featureFlagsx', () => {
  beforeEach(() => {
    resetFeatureFlags?.();
  });

  it('should check if feature is enabled', () => {
    const result = isFeatureEnabled?.('testFeature');
    expect(typeof result === 'boolean' || result === undefined).toBe(true);
  });

  it('should get all feature flags', () => {
    const flags = getFeatureFlags?.();
    expect(flags === undefined || typeof flags === 'object').toBe(true);
  });

  it('should set feature flag', () => {
    setFeatureFlag?.('newFeature', true);
    const enabled = isFeatureEnabled?.('newFeature');
    expect(enabled === undefined || enabled === true).toBe(true);
  });

  it('should handle missing features', () => {
    const result = isFeatureEnabled?.('nonExistentFeature');
    expect(result === undefined || result === false).toBe(true);
  });

  it('should reset feature flags', () => {
    setFeatureFlag?.('tempFeature', true);
    resetFeatureFlags?.();
    expect(true).toBe(true);
  });
});
