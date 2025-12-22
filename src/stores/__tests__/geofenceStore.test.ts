import { describe, it, expect } from 'vitest';
import { useGeofenceStore } from '../geofenceStore';

describe('geofenceStore', () => {
  it('should have initial state', () => {
    const store = useGeofenceStore.getState();
    expect(store).toBeDefined();
  });
});